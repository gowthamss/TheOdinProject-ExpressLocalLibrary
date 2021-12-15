const mongoose = require("mongoose");
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxlength: 100 },
    family_name: { type: String, required: true, maxlength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
});

// Virtual for author's full name
AuthorSchema.virtual('name')
    .get(function() {
        return this.family_name + ', ' + this.first_name;
    });

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan')
    .get(function() {
        let lifespan_string = '';
        if (this.date_of_birth) {
            lifespan_string += DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
        } else {
            lifespan_string += 'No birth details available.';
            return lifespan_string;
        }
        if (this.date_of_death) {
            lifespan_string += ' - ' + DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
        } else {
            lifespan_string += ' - present';
        }
        return lifespan_string;
    })

// Virtual for author's URL
AuthorSchema.virtual('url')
    .get(function() {
        return '/catalog/author/' + this._id;
    });

// Virtual for author date of birth
AuthorSchema.virtual('date_of_birth_yyyy_mm_dd')
    .get(function() {
        return DateTime.fromJSDate(this.date_of_birth).toISODate();
    })

// Virtual for author date of death
AuthorSchema.virtual('date_of_death_yyyy_mm_dd')
    .get(function() {
        return DateTime.fromJSDate(this.date_of_death).toISODate();
    })


// Export model
module.exports = mongoose.model('Author', AuthorSchema);