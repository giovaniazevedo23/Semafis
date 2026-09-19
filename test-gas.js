const url = "https://script.google.com/macros/s/AKfycbwsr1rn7RN1WycAG3vjqsz7w21_n6pysUMlZsDhA7w5mUedEpQVx9uSRBheoDatJys_/exec";

async function testGas() {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        fileName: "teste.txt",
        mimeType: "text/plain",
        base64: Buffer.from("Hello World").toString('base64')
      })
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testGas();
