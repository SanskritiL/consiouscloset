async function analyzeFabricComposition() {
    console.log("Analyzing fabric composition...");

    // Cloudflare Worker endpoint
    const workerUrl = "https://black-sun-7868.sanslamsal16.workers.dev/";

    // Get the HTML content
    const htmlContent = document.body.innerText.substring(0, 5000);

    try {
        // Send request to Cloudflare Worker
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html_content: htmlContent }),
        });

        if (!response.ok) {
            throw new Error(`Worker request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Send the data to the Chrome runtime
        chrome.runtime.sendMessage({ type: "fabricData", data });

        console.log("Analysis completed successfully:", data);
        return data;
    } catch (error) {
        console.error("Error during fabric composition analysis:", error);
        return null;
    }
}

// Helper function to generate the prompt
function generatePrompt() {
    const htmlContent = document.body.innerText.substring(0, 5000);

    return `
Analyze the following HTML content and extract detailed information about the garment described. Provide the following in JSON format:

1. **Materials**: An object with material names as keys and their percentages as values. Include details about whether the materials are organic, recycled, or sustainably sourced.
2. **Description**: A brief product description highlighting key features and sustainability claims.
3. **Analysis**: A detailed assessment of potential greenwashing. Consider the following:
   - Are the materials environmentally friendly (e.g., organic cotton, recycled polyester)?
   - Are there any certifications or third-party verifications mentioned (e.g., GOTS, Fair Trade)?
   - Are the manufacturing processes described as sustainable (e.g., water-saving techniques, low-carbon emissions)?
   - Are there any vague or unsubstantiated claims that could be misleading?
4. **Score**: A sustainability rating from 1 to 5 based on the following criteria:
   - 1: No sustainability claims or evidence.
   - 2: Minimal sustainability claims with no supporting evidence.
   - 3: Some sustainability claims with partial evidence.
   - 4: Strong sustainability claims with substantial evidence.
   - 5: Excellent sustainability practices with clear, verifiable evidence.

If no garment composition or sustainability information is found, return an empty "materials" object, explain in the "analysis" field why no composition or sustainability details were found, and set the "score" to 0.
Also, be generous if good quality material is used like wool/cotton/linen, but be mindful if it's just a small mix of these, it's likely greenwashing.

Example output format:
{
  "materials": {"Organic Cotton": 60, "Recycled Polyester": 40},
  "description": "Lightweight jacket made of organic cotton and recycled polyester, certified by GOTS.",
  "analysis": "The product uses organic cotton and recycled polyester, which are environmentally friendly materials. The GOTS certification ensures sustainable and ethical production practices. However, there is no mention of water-saving techniques or carbon emissions in the manufacturing process.",
  "score": 4
}

HTML content:  
${htmlContent}
`;
}



// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "analyze") {
        analyzeFabricComposition();
    }
});