const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const expenseSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    expensedate: { type: Date, required: true },
    expensetype: { type: String, required: true },
    expenseamt: { type: String, required: true },
    expensedesc: { type: String }
});

expenseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Expense', expenseSchema);