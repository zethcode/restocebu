import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';

import useStyles from './styles';

const Map = () => {
    const classes = useStyles();
    const isMobile = useMediaQuery('(min-width:600px)');
    const cebuCoordinates = { lat: 10.3157, lng: 123.8854 };

    return (
        <div className={classes.mapContainer}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_PROJECT_API_KEY }}
                defaultCenter={cebuCoordinates}
                center={cebuCoordinates}
                defaultZoom={14}
                margin={[50, 50, 50, 50]}
            // options={''}
            // onChange={''}
            // onChildClick={''}
            >

            </GoogleMapReact>
            <h1>Map</h1>
        </div>
    )
}

export default Map
