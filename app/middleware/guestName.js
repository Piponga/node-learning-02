const availableGuestNamesArr = [];
let lastGuestNum = 0;

module.exports = function() {
    if (availableGuestNamesArr.length > 0) {
        return availableGuestNamesArr.pop();
    }

    lastGuestNum++;
    return 'Guest' + lastGuestNum;
};