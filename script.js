const addActivationBtn = document.querySelector(".activation-btn");
const formatBtn = document.querySelector(".formater");
const copyBtn = document.querySelector(".fa-copy");

formatBtn.addEventListener("click", formatToDiscord);

copyBtn.addEventListener("click", copy);

function copy() {
    // Get the text field
    const copyText = document.querySelector("textarea");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);

    // Alert the copied text
    const copyAlert = document.querySelector(".copy-box p");
    copyAlert.classList.add("active");
    setTimeout(() => copyAlert.classList.remove("active"), 1000)

}

function addActivation() {
    const activationContainer = document.querySelector(".activation-input-container");
    const activationElements = document.querySelectorAll(".activation-input-element");

    // Remove the buttons from the last element if it exists
    if (activationElements.length > 0) {
        removeButtons(activationElements[activationElements.length - 1]);
    }

    // Create new activation input element
    const div = document.createElement("div");
    div.classList.add("activation-input-element");

    const input = document.createElement("input");
    customAttribute(input, {
        type: "text",
        class: "activations",
        name: "activations",
        required: "true"
    });

    const plusBtn = createButton("+", addActivation);
    div.append(input, plusBtn);

    // Only add the minus button if there is more than one element
    if (activationElements.length > 0) {
        const minusBtn = createButton("-", removeElement);
        div.append(minusBtn);
    }

    activationContainer.appendChild(div);
}

function customAttribute(element, attributes = {}) {
    for (let attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
    }
}

function createButton(text, eventHandler) {
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add("activation-btn");
    button.addEventListener("click", eventHandler);
    return button;
}

function removeButtons(element) {
    const buttons = element.querySelectorAll(".activation-btn");
    buttons.forEach(button => button.remove());
}

function removeElement() {
    const element = this.closest(".activation-input-element");
    const prevElement = element.previousElementSibling;
    element.remove();

    const remainingElements = document.querySelectorAll(".activation-input-element");

    if (remainingElements.length === 1) {
        // If there's only one element left, ensure it only has a plus button
        removeButtons(remainingElements[0]);
        remainingElements[0].appendChild(createButton("+", addActivation));
    } else if (prevElement) {
        // Add buttons to the previous element if necessary
        prevElement.appendChild(createButton("+", addActivation));
        prevElement.appendChild(createButton("-", removeElement));
    }
}

addActivationBtn.addEventListener("click", addActivation);

function getDatas() {
    const inputs = document.querySelectorAll("input");
    const textarea = document.querySelector("textarea");
    let datas = {};
    let prix;
    let marge;
    let marginType;
    let devise;

    inputs.forEach(input => {
        const key = input.name;
        const value = input.value.trim(); // Remove leading/trailing whitespaces

        // Ignore radio buttons that are not related to currency
        if (input.type === "radio" && input.name === "devise") {
            // Check if the radio button is checked
            if (input.checked) {
                devise = input.value; // Get the value of the checked radio button
            }
            return;
        }

        // Ignore radio buttons that are not related to margin type
        if (input.type === "radio" && input.name === "margin-type") {
            // Check if the radio button is checked
            if (input.checked) {
                marginType = value; // Get the value of the checked radio button
            }
            return;
        }

        // Process other input types
        if (key === "prix") {
            prix = parseFloat(value);
        } else if (key === "marge") {
            marge = parseFloat(value);
        } else if (key === "activations" && value !== "") {
            if (!datas[key]) {
                datas[key] = []; // Initialize as an array if it doesn't exist
            }
            datas[key].push(value); // Push the value into the array
        } else if (value !== "") {
            datas[key] = value;
        }
    });

    // Calculate budget based on margin type
    if (marginType === "%") {
        datas["budget"] = `${(prix - (prix * (marge / 100))).toFixed(2)}`;
    } else {
        datas["budget"] = `${(prix - marge).toFixed(2)}`;
    }

    // Add formatted text if textarea is filled
    if (textarea.value.trim() !== "") {
        datas["formated-text"] = textarea.value.trim();
    }
    return datas

}

function formatToDiscord() {
    const textArea = document.querySelector("textarea");
    const devises = document.querySelectorAll('input[name="devise"]')
    let devise;
    devises.forEach(radio => {
        if (radio.checked) {
            devise = radio.value
        }
    })
    textArea.value = "";
    const datas = getDatas();

    // Créer des constantes pour chaque ligne de texte si elles existent dans l'objet datas
    const productLine = datas.produit ? `**Produit:** ${datas.produit}\n` : '';
    const dateLine = datas.date ? `**Date:** ${datas.date}\n` : '';
    const budgetLine = !isNaN(datas.budget) ? `**Budget:** ${datas.budget}${devise}\n` : '';
    const activationsLine = datas.activations ? `**Activations:**\n${datas.activations.map(activation => `- ${activation}`).join('\n')}\n` : '';
    const scriptLine = datas.script ? `**Script:** ${datas.script}\n` : '';
    const briefLine = datas.brief ? `**Brief:** ${datas.brief}\n` : '';
    const assetsLine = datas.assets ? `**Assets:** ${datas.assets}\n` : '';
    const trackingList = datas.trackingList ? `**Tracking List:** ${datas.trackingList}\n` : '';

    // Concaténer les lignes dans l'ordre souhaité
    const text = productLine + dateLine + budgetLine + activationsLine + scriptLine + briefLine + assetsLine + trackingList;

    textArea.value = text; // Définissez la valeur de la zone de texte
}


document.addEventListener("DOMContentLoaded", () => {
    function getSelectedValue(name) {
        const selectedInput = document.querySelector(`input[name=${name}]:checked`);
        return selectedInput ? selectedInput.value : null;
    }

    function addChangeListeners(name, callback) {
        const inputs = document.querySelectorAll(`input[name=${name}]`);
        inputs.forEach(input => {
            input.addEventListener("change", () => {
                callback(input.value);
            });
        });
    }

    function updateMarginSymbol(devise) {
        const marginSymbol = document.querySelector(".marge-symbol");
        if (devise === "€") {
            marginSymbol.textContent = "€";
        } else if (devise === "$") {
            marginSymbol.textContent = "$";
        }
    }

    // Initial detection of selected values
    const initialDevise = getSelectedValue('devise');

    // Update margin symbol based on initial devise
    updateMarginSymbol(initialDevise);

    // Add event listeners for changes
    addChangeListeners('devise', (value) => {
        updateMarginSymbol(value);
    });
});
