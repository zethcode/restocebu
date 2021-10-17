import axios from 'axios';

export const getRestaurants = async () => {
    return await axios.get(window.location.href + '/db/restaurant.json')
        .then((res) => {
            console.log("not printing", window.location.href)
            return [...res.data];
        }).catch((err) => {
            console.log("not printing", window.location.href)
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