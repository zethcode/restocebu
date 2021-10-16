import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Button, Fab, Typography, useMediaQuery, Snackbar, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import EditLocationAltIcon from '@material-ui/icons/EditLocation';
import restoPin from './../../assets/restaurant_pin.png';
import currentLocationPin from './../../assets/your_location_pin.png';
import { useForm } from 'react-hook-form';
import useStyles from './styles';

const libraries = ["drawing"];
const cebuCoordinates = { lat: 10.3157, lng: 123.8854 };
const acaciaSteakhouse = { lat: 10.3232, lng: 123.8919 };

// Commented: potential error handler
// const handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
//     infoWindow.setPosition(pos);
//     infoWindow.setContent(
//         browserHasGeolocation
//             ? "Error: The Geolocation service failed."
//             : "Error: Your browser doesn't support geolocation."
//     );
//     // infoWindow.open(map);
// }

const options = {
    styles: [
        {
            "featureType": "poi",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }
    ],
    disableDefaultUI: true,
    zoomControl: true,
};

const mapContainerStyle = {
    width: "100%",
    height: "100%"
};

function TransitionDown(props) {
    return <Slide {...props} direction="down" />;
}

const Map = () => {
    const classes = useStyles();
    const isDesktop = useMediaQuery('(min-width:600px)');
    const [restoPosition, setRestoPosition] = useState({});
    const [restoMarkers, setRestoMarkers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [drawMode, setDrawMode] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({})

    const handleClose = () => {
        setSnackbarOpen(false);
    };

    const handleDialogClose = () => {
        reset();
        setDialogOpen(false);
    };

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    })

    const GetLocation = ({ panToLocation }) => {
        const classes = useStyles();
        return (
            <Fab className={classes.locateBtn} size="large"
                onClick={() => handleLocateUserClick({ panToLocation })}
            >
                <MyLocationIcon className={classes.locateIcon} />
            </Fab>
        )
    }

    const handleLocateUserClick = ({ panToLocation }) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    panToLocation(pos.lat, pos.lng);

                    setCurrentLocation({ ...pos, name: "Your Location", date: new Date() });

                    // infoWindow.setPosition(pos);
                    // infoWindow.setContent("Location found.");
                    // infoWindow.open(map);
                    // map.setCenter(pos);
                },
                () => {
                    //handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            //handleLocationError(false, infoWindow, map.getCenter());
        }
    }

    // Save resto information on state handler
    const handleSaveRestaurant = useCallback(async values => {
        try {
            setRestoMarkers([...restoMarkers,
            {
                lat: parseFloat(restoPosition.lat),
                lng: parseFloat(restoPosition.lng),
                name: values.restoName,
                specialtyFood: values.specialtyFood,
                restoType: values.restoType,
                date: new Date()
            }
            ]);
            setDialogOpen(false);
            reset();
        } catch (error) {
            // setSigninFailed(true)
        }
    }, [restoMarkers, restoPosition, reset])

    const toggleDrawMode = () => {
        setDrawMode(!drawMode);
        !drawMode && setSnackbarOpen(!snackbarOpen);
    }

    const onMarkerLoad = (marker) => {
        console.log("Marker Data: ", marker);
    }

    const panToLocation = useCallback((lat, lng) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, [])

    const onMapClick = useCallback((event) => {
        setRestoPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        setDialogOpen(true);
    }, [])

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, [])

    if (loadError) return <h1>Error loading maps</h1>;
    if (!isLoaded) return <h1>Loading Maps</h1>;

    return (
        <div className={classes.mapContainer}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={14}
                center={cebuCoordinates}
                options={options}
                onClick={drawMode && onMapClick}
                onLoad={onMapLoad}
            >
                <Snackbar
                    ContentProps={{
                        classes: {
                            root: classes.snackbar
                        }
                    }}
                    open={snackbarOpen}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                    onClose={handleClose}
                    TransitionComponent={TransitionDown}
                    message="Start adding restaurants by clicking anywhere on the map!"
                    key={TransitionDown.name}
                />
                <GetLocation panToLocation={panToLocation} />
                {restoMarkers.map((marker) => {
                    return <Marker
                        key={marker.date.toISOString()}
                        onLoad={onMarkerLoad}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        icon={{
                            url: restoPin,
                            scaledSize: new window.google.maps.Size(30, 30),
                            origin: new window.google.maps.Point(0, 0)
                        }}
                        onClick={() => {
                            setSelected(marker)
                        }}
                    />
                })}

                {selected &&
                    (<InfoWindow
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => { setSelected(null) }}
                    >
                        <div>
                            <h3>{selected.name}</h3>
                            <p>Date Created: {selected.date.getMonth() + "-" + selected.date.getDate() + "-" + selected.date.getFullYear()}</p>
                            <p>Update - Delete</p>
                        </div>
                    </InfoWindow>)}
                {currentLocation &&
                    <Marker
                        onLoad={onMarkerLoad}
                        position={{ lat: parseFloat(currentLocation.lat), lng: parseFloat(currentLocation.lng) }}
                        icon={{
                            url: currentLocationPin,
                            scaledSize: new window.google.maps.Size(30, 30),
                            origin: new window.google.maps.Point(0, 0),
                            anchor: new window.google.maps.Point(15, 15)
                        }}
                        onClick={() => {
                            setSelected(currentLocation)
                        }}
                    />
                }

                <Button className={classes.drawBtn} size="small"
                    onClick={() => toggleDrawMode()}
                >
                    {drawMode ?
                        <Typography variant="subtitle1">Done</Typography>
                        :
                        <Typography variant="subtitle1">
                            Edit Map
                        </Typography>

                    }
                </Button>

                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                    <DialogTitle>Add Restaurant</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please fill out the required information
                        </DialogContentText>
                        <form onSubmit={handleSubmit(handleSaveRestaurant)}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="resto-name"
                                name="restoName"
                                label="Restaurant Name"
                                variant="filled"
                                fullWidth
                                required
                                {...register("restoName")}
                            />
                            <TextField
                                margin="dense"
                                id="resto-description"
                                name="restoDesc"
                                label="Short Description"
                                placeholder="e.g. Calm environment, get productive while dining..."
                                variant="filled"
                                fullWidth
                                required
                                {...register("description")}
                            />
                            <TextField
                                margin="dense"
                                id="specialty-food"
                                name="specialtyFood"
                                label="Specialty Food"
                                placeholder="e.g. Steak"
                                variant="filled"
                                fullWidth
                                required
                                {...register("specialtyFood")}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="resto-type-label" required>Restaurant Type</InputLabel>
                                <Select
                                    labelId="resto-type-label"
                                    id="resto-type-select"
                                    name="restoType"
                                    placeholder="Select Type..."
                                    label="Restaurant Type"
                                    defaultValue="Others"
                                    required
                                    {...register("restoType")}
                                >
                                    <MenuItem value="Fine Dining">Fine Dining</MenuItem>
                                    <MenuItem value="Casual Dining">Casual Dining</MenuItem>
                                    <MenuItem value="Eat All You Can">Eat All You Can</MenuItem>
                                    <MenuItem value="Fast Food">Fast Food</MenuItem>
                                    <MenuItem value="Cafe">Cafe</MenuItem>
                                    <MenuItem value="Others">Others</MenuItem>
                                </Select>
                            </FormControl>
                            <DialogActions>
                                <Button onClick={handleDialogClose}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Dialog>
            </GoogleMap>
            <h1>Map</h1>
        </div>
    )
}

export default Map
