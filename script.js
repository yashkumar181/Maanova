class MentalHealthChatbot {
  constructor() {
    this.messages = [
      {
        id: "1",
        content:
          "Hello! I'm here to provide mental health support and guidance. How are you feeling today? Remember, this is a safe and confidential space.",
        sender: "bot",
        timestamp: new Date(),
        type: "normal",
      },
    ]
    this.isTyping = false

    this.crisisKeywords = ["suicide", "kill myself", "end it all", "hurt myself", "die"]
    this.anxietyKeywords = ["anxious", "anxiety", "panic", "worried", "stress", "overwhelmed"]
    this.depressionKeywords = ["depressed", "sad", "hopeless", "empty", "worthless"]

    this.supportiveResponses = [
      "Thank you for sharing that with me. It takes courage to reach out. Can you tell me more about what's been on your mind lately?",
      "I'm here to listen and support you. What's been the most challenging part of your day or week?",
      "It sounds like you're going through something difficult. Would you like to explore some coping strategies, or would you prefer to talk about what's bothering you?",
      "Your feelings are valid, and it's okay to not be okay sometimes. What kind of support would be most helpful for you right now?",
    ]

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

    setTimeout(() => {
      const botResponse = this.generateBotResponse(inputValue)
      this.messages.push(botResponse)
      this.hideTypingIndicator()
      this.renderMessages()
    }, 1500)
  }

  generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase()

    // Crisis detection
    if (this.crisisKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        id: Date.now().toString(),
        content:
          "I'm very concerned about what you're sharing. Your safety is the most important thing right now. Please reach out to a crisis counselor immediately at 988 (Suicide & Crisis Lifeline) or contact your campus emergency services. Would you like me to help you find immediate professional support?",
        sender: "bot",
        timestamp: new Date(),
        type: "crisis",
      }
    }

    // Anxiety support
    if (this.anxietyKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        id: Date.now().toString(),
        content:
          "I hear that you're feeling anxious or stressed. That's really common among college students. Let's try a quick breathing exercise: Breathe in for 4 counts, hold for 4, breathe out for 6. Repeat this 3 times. Would you like some specific coping strategies for managing anxiety, or would you prefer to talk to a counselor?",
        sender: "bot",
        timestamp: new Date(),
        type: "normal",
      }
    }

    // Depression support
    if (this.depressionKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      return {
        id: Date.now().toString(),
        content:
          "Thank you for sharing how you're feeling. Depression can make everything feel harder, but you're not alone in this. Small steps can make a difference - have you been able to eat, sleep, or connect with anyone today? I can help you find professional support or coping resources. What feels most helpful right now?",
        sender: "bot",
        timestamp: new Date(),
        type: "referral",
      }
    }

    // General supportive response
    return {
      id: Date.now().toString(),
      content: this.supportiveResponses[Math.floor(Math.random() * this.supportiveResponses.length)],
      sender: "bot",
      timestamp: new Date(),
      type: "normal",
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
    if (typingIndicator) {
      typingIndicator.remove()
    }

    const chatInput = document.getElementById("chatInput")
    const sendButton = document.getElementById("sendButton")
    sendButton.disabled = chatInput.value.trim().length === 0
  }

  renderMessages() {
    const messagesContainer = document.getElementById("chatMessages")
    const messagesHtml = this.messages.map((message) => this.renderMessage(message)).join("")

    // Keep typing indicator if it exists
    const typingIndicator = document.getElementById("typingIndicator")
    messagesContainer.innerHTML = messagesHtml

    if (typingIndicator) {
      messagesContainer.appendChild(typingIndicator)
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  renderMessage(message) {
    const isUser = message.sender === "user"
    const messageClass = isUser ? "user-message" : "bot-message"
    const additionalClass =
      message.type === "crisis" ? "crisis-message" : message.type === "referral" ? "referral-message" : ""

    let actionButtons = ""
    if (message.type === "crisis") {
      actionButtons = `
                <button class="crisis-button" onclick="window.open('tel:988', '_self')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.75rem; height: 0.75rem;">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Call Crisis Line: 988
                </button>
            `
    } else if (message.type === "referral") {
      actionButtons = `
                <button class="referral-button" onclick="alert('Booking system would open here')">
                    Book Counselor Appointment
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

// Initialize the chatbot when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new MentalHealthChatbot()
})
