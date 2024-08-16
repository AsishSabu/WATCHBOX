function generateUniqueOrderID(order) {
    let orderID;
    do {
        orderID = generateRandomOrderID();
        console.log(orderID);
    } while (order.includes(orderID));

    return orderID;
}

function generateRandomOrderID() {
    const min = 100000;
    const max = 999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min).padStart(6, "0");
}

module.exports = { generateUniqueOrderID };