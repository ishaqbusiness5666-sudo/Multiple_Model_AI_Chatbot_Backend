const axios = require("axios");
const dotenv = require("dotenv");
const { App } = require("./src/App");

dotenv.config();

const MessageDatabase = [];
let ModelByUser=""


App.post("/ai/model", (req, res) => {
  try {
    ModelByUser = req.body.model;
    console.log(ModelByUser);
    
    res.status(200).send("Model Updated Successfully");
  } catch (error) {
    console.error("something is wrong", error);

    res.status(500).send("Server Error");
  }
});

App.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    MessageDatabase.push({ role: "user", content: userMessage });
    console.log("User Message:", userMessage);

    // Fallback to a valid free model if selected model is empty or not yet synchronized
    const modelToUse = ModelByUser || "google/gemma-2-9b-it:free";
    console.log("Using model:", modelToUse);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: "Replay shortly and clearly in under 3 sentences.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiMessage = response.data?.choices?.[0]?.message?.content || "No response content";
    console.log("AI Message:", aiMessage);
    MessageDatabase.push({ role: "assistant", content: aiMessage });

    res.status(200).json(response.data);

  } catch (error) {
    const errData = error.response?.data || error.message;
    console.log("OpenRouter Error Details:", errData);

    res.status(500).json({
      error: "Something went wrong",
      details: errData
    });
  }
});

App.get("/messages", (req, res) => {
  try {
    res.json(MessageDatabase);
    res.status(200);
    console.log(MessageDatabase);
  } catch (error) {
  }

});

const port = process.env.PORT || 5000;

App.listen(port, () => {
  console.log("Server running on port 5000");
});
