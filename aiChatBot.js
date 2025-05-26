const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// Set the API key and URL
const API_KEY = ''; // Add your API key here as a string, e.g. 'AIzaSy...'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let typingInterval, controller;
const chatHistory = [];
const userData = { message: "", file: {} };

// Function to create a message element
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");  
  div.classList.add("message", ...classes);
  div.innerHTML = content;

  return div;
}

// Function to scroll to the bottom of the chat container
const scrollToBottom = () => container.scrollTo({
  top: container.scrollHeight,
  behavior: "smooth",
  
})

// Function to create a typing effect
const typingEffect = ( text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  // Add loading class to bot message div
  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    } 
  },40);
}

// Function to generate a response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text")
  controller = new AbortController();

  chatHistory.push({
    role: "user",
    parts: [{text: userData.message }, ...(userData.file.data ? [{inline_data: (({fileName, isImage, ... rest}) => rest)(userData.file) }] : [])],
  });
 // Add bot message to chat history
  try{
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({contents: chatHistory}),
      signal: controller.signal
    });

    // Check if the response is ok
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
    typingEffect( responseText, textElement, botMsgDiv);

    chatHistory.push({role: "model", parts: [{text: responseText} ]});

  } catch (error){
    textElement.style.color = "lightgreen"
    textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : "An error occurred. Please try again.";
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    scrollToBottom();
  } finally {
    userData.file = {};
  }
}


// Function to handle form submission
const handleFormSubbmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage ||  document.body.classList.contains("bot-responding ")) return;

  promptInput.value = "";
  userData.message = userMessage;
  document.body.classList.add("bot-responding", "chats-active");
  fileUploadWrapper.classList.remove("active","img-attached" ,"file-attached");

  const userMsgHTML = `
  <p class="message-text"></p>
  ${userData.file.data ? userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />` : `<p class="file-attachment">
    <span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`: ""}
`;

  const userMsgDiv = createMsgElement(userMsgHTML , "user-message");

  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  // Add user message to chat history
  setTimeout(() => {
    const botMsgHTML = `<img src="pic/aiBot.png" alt="" class="avater"><p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML , "bot-message", "loading");  

    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  } ,600);

} 

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");

    userData.file = {fileName: file.name, data: base64String, mime_type: file.type, isImage};
  }
});

// Function to handle cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("active","img-attached" ,"file-attached");
})

// Function to handle ongoing bot upload
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  userData.file = {};
  controller?.abort();
  clearInterval(typingInterval);
  chatsContainer.querySelector(".bot-messsage.loading").classList.remove("loading");
  document.body.classList.remove("bot-responding");
})
  
// Function to handle delete btn click
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatsContainer.innerHTML = "";
  document.body.classList.remove("bot-responding", "chats-active");
})

// Function to handle suggestions
document.querySelectorAll(".suggestions-item").forEach(item => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

document.addEventListener("click", ({target}) => {
  const wrapper = document.querySelector(".prompt-wrapper");
  const shouldHide = target.classList.contains("prompt-wrapper") || (wrapper.classList.contains
  ("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-response-btn"));
  wrapper.classList.toggle("hide-controls", shouldHide);
});

// Function to toggle theme
themeToggle.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

// Initialize theme based on localStorage
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

promptForm.addEventListener("submit", handleFormSubbmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());