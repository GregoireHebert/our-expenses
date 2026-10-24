import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
    convertToArrayOfObject(people, callback) {
        return callback(
            people ? JSON.parse(people) : []
        );
    },

    convertToStringWithSeparators(people) {
        return JSON.stringify(people);
    },

    all(callback) {
        try {
            return AsyncStorage.getItem('@people', (err, people) =>
                this.convertToArrayOfObject(people, callback)
            );
        } catch(e) {
            console.log(e);
        }
    },

    save(people) {

        AsyncStorage.setItem('@people', this.convertToStringWithSeparators(people));
    }
};
