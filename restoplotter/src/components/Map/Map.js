import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery } from '@material-ui/core';
import LocationOutlinedIcon from '@material-ui/icons/LocationCityOutlined';

import useStyles from './styles';

const Map = () => {
    const classes = useStyles();
    const isMobile = useMediaQuery('(min-width:600px)');
    const cebuCoordinates = { lat: 0, lng: 0 };

    return (
        <div className={classes.mapContainer}>
            <h1>Map</h1>
        </div>
    )
}

export default Map
