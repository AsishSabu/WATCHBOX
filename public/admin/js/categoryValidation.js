function categoryValidation() {
    const nameRegex = /^[A-Za-z]+$/; // Name validation regex
    const name = document.getElementById("name");
    const err = document.getElementById("nameerr");
    const offer = document.getElementById("offer");
    const offerr = document.getElementById("offerr");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const dateErr = document.getElementById("dateerr");

    // Validate name
    if (!nameRegex.test(name.value.trim())) {
        err.innerHTML = "Use only alphabets in name";
        return false;
    } else {
        err.innerHTML = ""; // Clear the error message if validation passes
    }

    // If offer is not empty, validate offer and other fields
    if (offer.value !== "") {
        // Validate offer
        if (isNaN(offer.value) || Number(offer.value) <= 0) {
            offerr.innerHTML = "Offer should be a positive integer";
            return false;
        } else {
            offerr.innerHTML = ""; // Clear the error message if validation passes
        }

        // Validate start date and end date
        const startDateValue = new Date(startDate.value);
        const endDateValue = new Date(endDate.value);

        if (startDateValue >= endDateValue) {
            dateErr.innerHTML = "Start date must be before end date";
            return false;
        } else {
            dateErr.innerHTML = ""; // Clear the error message if validation passes
        }

        // Check if description is empty
        const description = document.getElementById("description").value.trim();
        if (description === "") {
            // Display error message for description
            // Assuming you have an element with id "descriptionerr" for the error message
            document.getElementById("descriptionerr").innerHTML = "Description is required";
            return false;
        }
    }

    // If all validations pass or if offer is empty, return true
    return true;
}
