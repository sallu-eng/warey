const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const { createClient } = require('@supabase/supabase-js');

app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

/* -----------------------------
   AUDIT LOG SYSTEM
--------------------------------*/

const auditLogs = [];

function logAction(user, action, details) {
  const entry = {
    timestamp: new Date(),
    user,
    action,
    details,
  };
  auditLogs.push(entry);
  console.log(`[AUDIT] ${entry.timestamp.toISOString()} - ${user}: ${action} (${details})`);
}

/* -----------------------------
   AUTH (Supabase connected)
--------------------------------*/

app.post("/api/auth", async (req, res) => {
  const { employeeId } = req.body;

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (data) {
      logAction(employeeId, "LOGIN", "Success");
      res.json({ success: true, user: data });
    } else {
      logAction(employeeId || "Unknown", "LOGIN", "Failed");
      res.status(401).json({ success: false, message: "Invalid Employee ID" });
    }
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -----------------------------
   INVENTORY (Supabase connected)
--------------------------------*/

app.get("/api/items", async (req, res) => {
  const { data, error } = await supabase.from('items').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.get("/api/items/:id", async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ message: "Item not found" });
  res.json(data);
});

app.post("/api/items/update", async (req, res) => {
  const { id, availability, quantity } = req.body;

  const { data, error } = await supabase
    .from('items')
    .update({ availability, quantity })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "Item not found or update failed" });
  }

  logAction("SYSTEM", "STOCK_UPDATE", `Item ${id} updated`);
  res.json({ success: true, item: data });
});

/* -----------------------------
   AUDIT LOGS
--------------------------------*/

app.get("/api/audit", (req, res) => {
  res.json(auditLogs);
});

/* -----------------------------
   AI QUERY & MEMORY SYSTEM
--------------------------------*/

// New Endpoint: Fetch chat history for the frontend UI on load
app.get("/api/ai/history/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  
  const { data, error } = await supabase
    .from('chat_history')
    .select('role, content')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: true }) // Oldest first for the UI
    .limit(20);

  if (error) {
    console.error("Fetch history error:", error);
    return res.status(500).json({ message: "Failed to fetch history" });
  }
  
  res.json(data || []);
});

// Updated Endpoint: Process queries with context memory
app.post("/api/ai/query", async (req, res) => {
  const { query, employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: "employeeId is required for chat history." });
  }

  try {
    // 1. Direct Item Lookup (Bypass AI if it looks like an item ID)
    // Adjust this regex depending on your actual item ID format (e.g., ITM-102)
    const match = query.match(/[A-Z]{2,3}-\d{3,4}/); 
    if (match) {
      const itemId = match[0];
      const { data: item } = await supabase.from('items').select('*').ilike('id', itemId).single();
      if (item) {
        return res.json({ response: `${item.name} is located at ${item.location}. Quantity available: ${item.quantity}.` });
      }
    }

    // 2. Fetch the last 10 messages from Supabase for AI context
    const { data: historyData } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false }) 
      .limit(10);

     // Reverse so the AI reads chronologically
    const formattedHistory = historyData ? historyData.reverse() : [];

    // 3. Construct messages for HuggingFace
    const messages = [
      { 
        role: "system", 
        content: `You are Warey, a fast, friendly, and interactive AI assistant for a warehouse management system.
        Strict Rules:
        1. Keep responses extremely SHORT and SWEET (1 to 2 sentences maximum).
        2. Be conversational and interactive. End your responses with a quick, relevant follow-up question (e.g., "Need me to update the stock?", "What's next?").
        3. Only talk about warehousing, inventory, logistics, or employees. Decline outside topics in one quick sentence.
        4. If you don't know the exact data or location, just make up a realistic, quick warehouse answer. Don't overthink it.` 
      },
      ...formattedHistory,
      { role: "user", content: query }
    ];

    // 4. Call HuggingFace AI
    const aiResponse = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: messages,
        // Lower max_tokens to physically prevent long, rambling responses
        max_tokens: 60 
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const aiText = aiResponse.data.choices[0].message.content;

    // 5. Save the new interaction to the database in the background
    supabase.from('chat_history').insert([
      { employee_id: employeeId, role: 'user', content: query },
      { employee_id: employeeId, role: 'assistant', content: aiText }
    ]).then(({ error }) => {
        if (error) console.error("Failed to save chat history:", error.message);
    });

    return res.json({ response: aiText });

  } catch (error) {
    console.error("Server Error:", error.response?.data || error.message);
    return res.json({ response: "AI service error. Please try again." });
  }
});

/* -----------------------------
   EMPLOYEE MANAGEMENT (Supabase)
--------------------------------*/

app.get('/api/employees', async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('id', { ascending: true }); 

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

app.post('/api/employees/add', async (req, res) => {
  const { id, name, role } = req.body;

  const { data, error } = await supabase
    .from('employees')
    .insert([{ id, name, role }]);

  if (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Employee ID already exists!' });
    }
    return res.status(500).json({ message: error.message });
  }
  
  logAction("SYSTEM", "EMPLOYEE_ADD", id);
  res.status(201).json({ message: 'Employee added successfully' });
});

app.put('/api/employees/:id', async (req, res) => {
  const employeeId = req.params.id;
  const { name, role } = req.body;

  const { data, error } = await supabase
    .from('employees')
    .update({ name, role })
    .eq('id', employeeId);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Employee updated successfully' });
});

app.delete('/api/employees/:id', async (req, res) => {
  const employeeId = req.params.id;

  const { data, error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);

  if (error) return res.status(500).json({ message: error.message });
  
  logAction("SYSTEM", "EMPLOYEE_DELETE", employeeId);
  res.json({ message: 'Employee deleted successfully' });
});

/* -----------------------------
   SERVER START
--------------------------------*/

app.get("/", (req, res) => {
  res.send("Warey Backend API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Warey backend running at http://localhost:${PORT}`);
});