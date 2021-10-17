import axios from 'axios';

export const getRestaurants = async () => {
    return await axios.get('./db/restaurant.json')
        .then((res) => {
            return [...res.data];
        }).catch((err) => {
            return {};
        })
}

// export const setRestaurants = async (restaurants) => {

//     const json = JSON.stringify(restaurants);
//     const res = await axios.post('./db/restaurant.json', { data: json }, {
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });

//     return res.data
// }