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

    /**
     * Generates a random string of (length) length.
     * @param {number} length
     * @returns {string} Generated String
     */
    stringGenerator(length = 32) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;
    }

    /**
     * Holds information for settings
     */
    settings = [
        {
            id: "title",
            type: "text",
            label: "Reaction Title",
            default: "Live Reaction",
            small: "The title that displays above the emote image & reaction count.",
            minlength: 0,
            maxlength: 30,
            required: false,
        },
        {
            id: "font",
            type: "select",
            label: "Font / Theme",
            default: "archivo-black",
            small: "Change the colors / fonts used in the Live Reaction screen.",
            optgroup: [
                {
                    label: "Fonts",
                    opts: [
                        {
                            value: "archivo-black",
                            name: "Archivo Black",
                        },
                        {
                            value: "pacifico",
                            name: "Pacifico",
                        },
                        {
                            value: "barrio",
                            name: "Barrio",
                        },
                    ],
                },
                {
                    label: "Themes",
                    opts: [
                        {
                            value: "blondedaze",
                            name: "Blondedaze",
                        }
                    ]
                },
            ],
        },
        {
            id: "emote_threshold",
            type: "number",
            label: "Emote Threshold",
            default: 3,
            small: "The number of messages with a specified emote required to start a Live Reaction.",
            min: 1,
            max: 100,
            step: 1,
            required: true,
        },
        {
            id: "emote_window",
            type: "number",
            label: "Emote Window",
            default: 10,
            small: "The number of seconds an emote has to reach the Emote Threshold to start a Live Reaction.",
            min: 5,
            max: 100,
            step: .5,
            required: true,
        },
        {
            id: "user_emote_limit",
            type: "number",
            label: "User Emote Limit",
            default: 2,
            small: "The message limit per user that can count towards the Emote Window. This prevents a single user from starting a Live Reaction.",
            min: 1,
            max: 100,
            step: 1,
            required: true,
        },
        {
            id: "reaction_sustain_time",
            type: "number",
            label: "Reaction Sustain Time",
            default: 10,
            small: "After a Live Reaction has started, this is the time in which another message with the emote must be sent to continue the Live Reaction.",
            min: 5,
            max: 100,
            step: .5,
            required: true,
        },
    ];

    /**
     * Returns possible values for a Select setting
     * @param setting
     * @returns {string[]}
     */
    getPossibleSelectValues(setting) {
        let values = [];
        setting.optgroup.forEach(group => {
            values = [
                ...values,
                ...group.opts.map(x => x.value),
            ];
        });
        return values;
    }

    validateSetting(setting, value) {
        if (setting) {
            if (setting.required && (typeof value === "undefined" || value === null)) {
                throw `Required property ${setting.id} is missing!`;
            }

            if (setting.type === "number") {
                value = Number(value);

                if (isNaN(value)) {
                    throw `Property ${setting.id} is not a number!`;
                } else if (setting?.min && value < setting.min) {
                    throw `Property ${setting.id} must be greater than ${setting.min}!`;
                } else if (setting?.max && value > setting.max) {
                    throw `Property ${setting.id} must be greater than ${setting.max}!`;
                } else if (setting?.step && value % setting.step !== 0) {
                    throw `Property ${setting.id} must have a step of ${setting.step}!`;
                }
            } else if (setting.type === "text") {
                if (setting?.minlength && value.length < setting.minlength) {
                    throw `Property ${setting.id} must be greater than ${setting.minlength} characters!`;
                } else if (setting?.maxlength && value.length > setting.maxlength) {
                    throw `Property ${setting.id} must be less than ${setting.maxlength} characters!`;
                }
            } else if (setting.type === "select") {
                const values = this.getPossibleSelectValues(setting);
                if (!values.includes(value)) {
                    throw `Property ${setting.id} must be one of the following values: ${values.join(", ")}`;
                }
            }
        } else {
            console.error(`Unknown setting: ${setting.id} (${value})`);
        }
    }

    validateSettings(input) {
        this.settings.forEach(setting => {
            this.validateSetting(setting, input[setting.id]);
        });
    }

    /**
     * Time the server was started
     * @type {number}
     */
    startTime;

    constructor() {
        this.startTime = Date.now();
    }
}

export default new Util();
