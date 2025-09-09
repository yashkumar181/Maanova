class MentalHealthChatbot {
  constructor() {
    this.messages = [
      {
        id: "1",
        content:
          "Hello! I'm here to support you. How are you feeling today? Remember, this is a safe and confidential space.",
        sender: "bot",
        timestamp: new Date(),
        type: "normal",
      },
    ]
    this.isTyping = false

    // Crisis detection keywords (only hardcoded responses we keep)
    this.crisisKeywords = ["suicide", "kill myself", "end it all", "hurt myself", "die"]

    // Your Gemini API key (replace with your actual key)
    this.apiKey = "AIzaSyCnQ3remyl7Q4_NPYZA1noRGMPOnWgm0r8"
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      this.apiKey

    this.initializeEventListeners()
    this.renderMessages()
  }

  initializeEventListeners() {
    const chatInput = document.getElementById("chatInput")
    const sendButton = document.getElementById("sendButton")

    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.handleSendMessage()
      }
    })

    sendButton.addEventListener("click", () => {
      this.handleSendMessage()
    })

    chatInput.addEventListener("input", () => {
      const hasText = chatInput.value.trim().length > 0
      sendButton.disabled = !hasText || this.isTyping
    })
  }

  handleSendMessage() {
    const chatInput = document.getElementById("chatInput")
    const inputValue = chatInput.value.trim()

    if (!inputValue || this.isTyping) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    this.messages.push(userMessage)
    chatInput.value = ""
    this.renderMessages()

    this.showTypingIndicator()

    this.generateBotResponse(inputValue).then((botResponse) => {
      this.messages.push(botResponse)
      this.hideTypingIndicator()
      this.renderMessages()
    })
  }

  async generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase()

    // Crisis detection first
    if (this.crisisKeywords.some((kw) => lowerMessage.includes(kw))) {
      return {
        id: Date.now().toString(),
        content:
          "⚠️ I'm very concerned about your safety. Please reach out to a crisis counselor immediately at 988 (Suicide & Crisis Lifeline) or contact your campus emergency services. You're not alone, and help is available right now.",
        sender: "bot",
        timestamp: new Date(),
        type: "crisis",
      }
    }

    // Build chat history for Gemini
    const history = this.messages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))

    // Add system prompt at the very beginning
    history.unshift({
      role: "system",
      parts: [
        {
          text: `You are a supportive and empathetic mental health companion for college students. 
Your style is warm, human-like, and conversational. 
Always validate feelings, ask gentle follow-up questions, and offer coping strategies like breathing, journaling, grounding, or reaching out to friends. 
Avoid giving medical diagnoses. If someone is in crisis, encourage them to reach professional help immediately.`,
        },
      ],
    })

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: history }),
      })

      const data = await response.json()
      const botText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm here to listen. Please tell me more."

      return {
        id: Date.now().toString(),
        content: botText,
        sender: "bot",
        timestamp: new Date(),
        type: "normal",
      }
    } catch (error) {
      console.error("Error fetching Gemini response:", error)
      return {
        id: Date.now().toString(),
        content: "I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        type: "error",
      }
    }
  }

  showTypingIndicator() {
    this.isTyping = true
    document.getElementById("sendButton").disabled = true

    const typingHtml = `
      <div class="message typing-indicator" id="typingIndicator">
        <div class="message-avatar bot-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
          </svg>
        </div>
        <div class="message-content">
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `

    const messagesContainer = document.getElementById("chatMessages")
    messagesContainer.insertAdjacentHTML("beforeend", typingHtml)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  hideTypingIndicator() {
    this.isTyping = false
    const typingIndicator = document.getElementById("typingIndicator")
    if (typingIndicator) typingIndicator.remove()

    const chatInput = document.getElementById("chatInput")
    const sendButton = document.getElementById("sendButton")
    sendButton.disabled = chatInput.value.trim().length === 0
  }

  renderMessages() {
    const messagesContainer = document.getElementById("chatMessages")
    const messagesHtml = this.messages.map((message) => this.renderMessage(message)).join("")

    // Preserve typing indicator if exists
    const typingIndicator = document.getElementById("typingIndicator")
    messagesContainer.innerHTML = messagesHtml
    if (typingIndicator) messagesContainer.appendChild(typingIndicator)

    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  renderMessage(message) {
    const isUser = message.sender === "user"
    const messageClass = isUser ? "user-message" : "bot-message"
    const additionalClass = message.type === "crisis" ? "crisis-message" : ""

    let actionButtons = ""
    if (message.type === "crisis") {
      actionButtons = `
        <button class="crisis-button" onclick="window.open('tel:988', '_self')">
          Call Crisis Line: 988
        </button>
      `
    }

    return `
      <div class="message ${messageClass} ${additionalClass}">
        <div class="message-avatar ${isUser ? "user-avatar" : "bot-avatar"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${
              isUser
                ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
                : '<circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>'
            }
          </svg>
        </div>
        <div class="message-content">
          <p>${message.content}</p>
          ${actionButtons}
        </div>
      </div>
    `
  }
}

// Initialize chatbot
document.addEventListener("DOMContentLoaded", () => {
  new MentalHealthChatbot()
})
