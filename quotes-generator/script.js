const btnEl = document.getElementById("btn");
const cQuote = document.getElementById("quote");
const apiKey = "rCPrSR0MyddVnx1h8unveFe2x28xwGL5yAWk1Can";
const apiURL = "https://api.api-ninjas.com/v2/randomquotes?categories=success,inspirational";

const options = {
    method: "GET",
    headers: {
        "X-Api-Key": apiKey,
    },
};

async function getQuote(){
    
    try {
    btnEl.disabled = true;
    btnEl.innerText = "Loading...";
    cQuote.innerText = "Updating..."
    const response = await fetch(apiURL, options);
    const data = await response.json();

    console.log(data);
    cQuote.innerText = data[0].quote;
    btnEl.disabled = false;
    btnEl.innerText = "Refresh Quote";
    } 
    catch(error) {
        jokeEl.innerText = "An error happened, try again later";
        btnEl.disabled = false;
        btnEl.innerText = "Refresh Quote";
        console.log(error);
    }
}

btnEl.addEventListener("click", getQuote);