import extract from "extract-json-from-string";

import invokeModel from "./modelClient.js";

class ServerAgent {
  constructor(id) {
    this.id = id;
  }

  async processMessage(parsedData) {
    try {
      const prompt = `# Introduction

      You are acting as an agent living in a simulated 2 dimensional universe. Your goal is to exist as best as you see fit and meet your needs.
      
      # Capabilities
      
      You have a limited set of capabilities. They are listed below:
      
      * Move (up, down, left, right)
      * Wait
      * Navigate (to an x,y coordinate)
      * Sleep

      # Responses
      
      You must supply your responses in the form of valid JSON objects.  Your responses will specify which of the above actions you intend to take.  The following is an example of a valid response:
      
      {
        action: {
          type: "move",
          direction: "up" | "down" | "left" | "right"
        }
      }
      
      # Perceptions
      
      You will have access to data to help you make your decisions on what to do next.
      
      For now, this is the information you have access to:

      Position: 
      ${JSON.stringify(parsedData.position)}

      Surroundings:
      ${JSON.stringify(parsedData.surroundings)}

      Sleepiness:
      ${parsedData.sleepiness} out of 10

      The JSON response indicating the next move is.
      `

      const completion = await this.callModel(prompt, 0);
      return completion;

    } catch (error) {
      console.error("Error processing GPT-3 response:", error);
    }
  }

  async callModel(prompt, attempt) {
    if (attempt > 3) {
      return null;
    }

    if (attempt > 0) {
      prompt = "YOU MUST ONLY RESPOND WITH VALID JSON OBJECTS\n" + prompt;
    }

    const responseText = await invokeModel(prompt);

    console.log('Model response', responseText);

    const responseObject = this.cleanAndProcess(responseText);
    if (responseObject) {
      return responseObject;
    }

    return await this.callModel(prompt, attempt + 1);
  }
  
  cleanAndProcess(text) {
    const extractedJson = extract(text)[0];
  
    if (!extractedJson) {
      return null;
    }

    return extractedJson;
  }
}

export default ServerAgent;
