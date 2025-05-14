const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const retioSelect = document.getElementById("retio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY ="" // Replace with your Hugging Face API token//

// Example prompts for the prompt input field//
const examplePrompts = [
  "A futuristic city skyline at sunset, with flying cars and neon lights.",
  "A serene landscape with mountains, a lake, and a clear blue sky.",
  "A close-up of a beautiful flower with intricate details and vibrant colors.",
  "A fantasy creature, like a dragon or unicorn, in a magical forest.",
  "A retro-style poster of a space adventure, with planets and spaceships.",
  "A cozy cabin in the woods during winter, with snow-covered trees and smoke from the chimney.",
  "A surreal dreamscape with floating islands and whimsical creatures.",
  "A steampunk-inspired machine with gears, pipes, and intricate details.",
  "A portrait of a person in a historical costume, like a Victorian dress or a medieval knight.",
  "A vibrant underwater scene with colorful fish, coral reefs, and sunlight filtering through the water."
];

// Function to set the theme based on user preference or system preference//

(() => {

 // Check if the user has a saved theme preference in localStorage//  
  const savedTheme = localStorage.getItem("theme");
  const systemPreferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkTheme = savedTheme === "dark" || (savedTheme === null && systemPreferDark); 
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

// Function to toggle the theme and save the preference in localStorage//
const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

// Function to get image dimensions based on aspect ratio and base size//
const getImageDimensions = (aspectRetio, baseSize = 512) => {
 
  const[width, height] = aspectRetio.split("/").map(Number); // Split the aspect ratio into width and height
  const scaleFactor = baseSize / Math.sqrt(width*height); // Calculate the scale factor based on the base size and aspect ratio 

  let calculatedWidth = Math.round(width * scaleFactor); // Calculate the width based on the aspect ratio and scale factor
  let calculatedHeight = Math.round(height * scaleFactor); // Calculate the height based on the aspect ratio and scale factor

  // Ensure the dimensions are multiples of 16 for compatibility with the AI model
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16; // Round down to the nearest multiple of 8
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16; // Round down to the nearest multiple of 8

  return {width: calculatedWidth, height: calculatedHeight}; // Return the calculated width and height
}

// Function to update the image card with the generated image//
const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`); // Get the image card element by its ID
  if(!imgCard) return; // If the image card doesn't exist, return

  imgCard.classList.remove("loading"); // Remove the loading class from the image card
  imgCard.innerHTML = `<img src="${imgUrl}" alt="image" class="result-img">
            <div class="img-overlay">
              <a href="${imgUrl}" class="img-download-btn" type="button" title="Download Image" download = "${Date.now()}.png)">
                <i class="fa-solid fa-download"></i>
              </a>
            </div>`; // Set the image source to the generated image URL
}


// Function to generate images using the Hugging Face API//

const generateImages = async(selectedModel, imageCount, aspectRetio, promptText) => {

  const MODEL_URLS = `https://api-inference.huggingface.co/models/${selectedModel}`; // Base URL for the model API
  const {width, height} = getImageDimensions(aspectRetio); // Get the image dimensions based on the selected aspect ratio

  generateBtn.setAttribute("disabled", true); // Disable the generate button to prevent multiple submissions

  // Create an array of promises to fetch images from the API
  const imagePromises = Array.from({length: imageCount}, async(_, i) => {

    // Create a unique ID for each image card
    try {
      const response = await fetch(MODEL_URLS,{
        headers: {  
          Authorization: `Bearer ${API_KEY}`, // Replace with your Hugging Face API token
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText, // The prompt text entered by the user
          parameters: {width, height},
          options: {wait_for_model: true, user_cache: false}, // Wait for the model to be ready

        })
      });

      if (!response.ok) throw new Error((await response.json())?.error); // Check for errors in the response

      // Check if the response is OK
      const result = await response.blob(); 
      updateImageCard(i, URL.createObjectURL(result)); // Update the image card with the generated image
    } catch (error) {
      console.error(error);
      const imgCard = document.getElementById(`img-card-${i}`); // Get the image card element by its ID
      imgCard.classList.replace("loading", "error"); // Replace the loading class with the error class
      imgCard.querySelector(".status-text").textContent = "Generation Failed! Check console for more details. "; // Update the status text to indicate an error
    }
  })

  await Promise.allSettled(imagePromises); // Wait for all image generation promises to resolve
  generateBtn.removeAttribute("disabled");
};

// Function to create image cards based on user input
const createImageCards = ( selectedModel, imageCount, aspectRetio, promptText) => { 
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRetio}">
            <div class="status-container">
              <div class="spinner"></div>
              <i class="fa-solid fa-triangle-exclamation"></i>
              <p class="status-text">Generating...</p>
            </div>  
          </div>`;
  }

  generateImages(selectedModel, imageCount, aspectRetio, promptText); // Call the function to generate images
}

// Function to handle form submission//
const handleFormSubmit = (event) => {
  event.preventDefault();// Prevent the default form submission behavior

  // Get the selected values from the form inputs//

  const selectedModel = modelSelect.value; // Default to "model1" if no value is selected 
  const imageCount = parseInt(countSelect.value) || 1; // Default to 1 if no value is selected
  const aspectRetio = retioSelect.value || "1/1"; // Default to "1:1" if no value is selected
  const promptText = promptInput.value.trim(); // Get the prompt value and trim whitespace

  createImageCards( selectedModel, imageCount, aspectRetio, promptText); // Log the values to the console  
  
}

// Event listeners for the prompt button and theme toggle//
promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt; 
  promptInput.focus();
})

promptForm.addEventListener("submit", handleFormSubmit);

themeToggle.addEventListener("click", toggleTheme);