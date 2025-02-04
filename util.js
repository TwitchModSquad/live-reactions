class Util {
    /**
     * Converts a number into a string with commas
     * Example: 130456 -> 130,456
     * @param {number} num
     * @returns {string}
     */
    comma(num) {
        if (!num) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

export default new Util();
