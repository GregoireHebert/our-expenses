import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
    convertToArrayOfObject(expenses, callback) {
        return callback(
            expenses ? JSON.parse(expenses) : []
        );
    },

    convertToStringWithSeparators(expenses) {
        return JSON.stringify(expenses);
    },

    all(callback) {
        try {
            return AsyncStorage.getItem('@expenses', (err, expenses) =>
                this.convertToArrayOfObject(expenses, callback)
            );
        } catch(e) {
            console.log(e);
        }
    },

    save(expenses) {

        AsyncStorage.setItem('@expenses', this.convertToStringWithSeparators(expenses));
    }
};
