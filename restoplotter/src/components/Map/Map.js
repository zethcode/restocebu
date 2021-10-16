import { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Button, Fab, Typography, useMediaQuery, Paper, Snackbar, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid } from '@material-ui/core';
import currentLocationPin from './../../assets/your_location_pin.png';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import restoPin from './../../assets/restaurant_pin.png';
import { getRestaurants } from './../../api/index';
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
    height: "100vh"
};

const TransitionDown = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Map = () => {
    const classes = useStyles();
    const [restoPosition, setRestoPosition] = useState({});
    const [restoMarkers, setRestoMarkers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [drawMode, setDrawMode] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState([]);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [placeInfoOpen, setPlaceInfoOpen] = useState(false);
    const daysOpenWatch = watch("daysOpen");

    useEffect(() => {
        const fetchRestaurantData = async () => {
            setRestoMarkers(await getRestaurants())
        }

        fetchRestaurantData();

    }, [])

    const handleClose = () => {
        setSnackbarOpen(false);
    };

    const handleDialogClose = () => {
        reset();
        setDialogOpen(false);
    };

    const handlePlaceInfoOpen = () => {
        setPlaceInfoOpen(true);
    };

    const handlePlaceInfoClose = () => {
        setPlaceInfoOpen(false);
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

                    let phDateNow = new Date();
                    let phFormattedDate = `${phDateNow.toLocaleString("en-PH", { month: "long" })}, ${phDateNow.getDate()} ${phDateNow.getFullYear()}`
                    let phFormattedTime = phDateNow.toLocaleTimeString("en-PH")

                    setCurrentLocation({ ...pos, name: "Your Location", dateCreated: `${phFormattedDate} ${phFormattedTime}` });

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
            let phDateNow = new Date();
            let phFormattedDate = `${phDateNow.toLocaleString("en-PH", { month: "long" })}, ${phDateNow.getDate()} ${phDateNow.getFullYear()}`;
            let phFormattedTime = phDateNow.toLocaleTimeString("en-PH");

            let updatedRestoData = [...restoMarkers, {
                id: restoPosition.lat + "" + restoPosition.lng,
                lat: parseFloat(restoPosition.lat),
                lng: parseFloat(restoPosition.lng),
                name: values.restoName,
                type: values.restoType,
                specialtyFood: values.specialtyFood,
                avgCustomer: values.avgCustomer,
                timeOpen: values.timeOpen,
                timeClose: values.timeClose,
                daysOpen: values.otherDaysOpen ? values.otherDaysOpen : values.daysOpen,
                dateCreated: `${phFormattedDate} ${phFormattedTime}`
            }];

            setRestoMarkers(updatedRestoData);
            setDialogOpen(false);
            reset();
        } catch (error) {
            // setSigninFailed(true)
        }
    }, [restoMarkers, restoPosition, reset])

    const PlaceInfoWindow = ({ restoDetails }) => (
        <Dialog
            open={placeInfoOpen}
            TransitionComponent={TransitionDown}
            keepMounted
            onClose={handlePlaceInfoClose}
            aria-describedby="alert-dialog-slide-description"
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                },
            }}
        >
            <DialogTitle className={classes.dialogTitle}>
                <Typography variant="h4" style={{ color: "white" }}>{restoDetails.name}</Typography>
                <Typography variant="subtitle1" style={{ color: "white" }}>{restoDetails.type}</Typography>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <Typography variant="subtitle1"><LocationOnIcon />{restoDetails.address}</Typography>
                <br />

                <DialogContentText id="alert-dialog-slide-description">{restoDetails.description}</DialogContentText>

            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button className={classes.dialogButtons} onClick={handlePlaceInfoClose}>Directions</Button>
                <Button style={{ borderRadius: "30px" }} onClick={handlePlaceInfoClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )

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
                    message="Add restaurants by clicking anywhere on the map."
                    key={TransitionDown.name}
                />
                <GetLocation panToLocation={panToLocation} />
                {restoMarkers.map((marker) => {
                    return (<div key={marker.id}>
                        <Marker
                            onLoad={onMarkerLoad}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            icon={{
                                url: restoPin,
                                scaledSize: new window.google.maps.Size(30, 30),
                                origin: new window.google.maps.Point(0, 0),
                                labelOrigin: new window.google.maps.Point(15, -10)
                            }}
                            label={{
                                text: marker.name,
                                fontSize: "15px",
                                fontWeight: "bold",
                                color: "#000",
                            }}
                            onClick={() => { setPlaceInfoOpen(true); setSelected(marker); }}
                        >
                        </Marker>
                    </div>)
                })}

                {/* {selected &&
                    (<InfoWindow
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => { setSelected(null) }}
                    >
                        <div>
                            <h3>{selected.name}</h3>
                            <p>Date Created: {selected.dateCreated}</p>
                            <p>Update - Delete</p>
                        </div>
                    </InfoWindow>)} */}

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
                            Add Restaurants
                        </Typography>

                    }
                </Button>

                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                    <DialogTitle>Add Restaurant</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            NOTE: No servers are currently set up for this app. This restaurant data will not be saved on your next visit.
                        </DialogContentText> <br />
                        <form onSubmit={handleSubmit(handleSaveRestaurant)}>
                            <Grid container>
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
                                <FormControl fullWidth margin="dense">
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
                                <Grid container spacing={2}>
                                    <Grid item xs={6} md={6}>
                                        <TextField
                                            margin="dense"
                                            id="customer-visits"
                                            name="customerVisits"
                                            label="Average Customers Per Day"
                                            variant="filled"
                                            type="number"
                                            fullWidth
                                            required
                                            {...register("avgCustomer")}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={6}>
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
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} md={6}>
                                        <TextField
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            margin="dense"
                                            id="time-open"
                                            name="timeOpen"
                                            label="Time Open"
                                            variant="filled"
                                            type="time"
                                            fullWidth
                                            required
                                            {...register("timeOpen")}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={6}>
                                        <TextField
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            margin="dense"
                                            id="time-close"
                                            name="timeClose"
                                            label="Time Close"
                                            variant="filled"
                                            type="time"
                                            fullWidth
                                            required
                                            {...register("timeClose")}
                                        />
                                    </Grid>
                                </Grid>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel id="days-open-label" required>Days Open</InputLabel>
                                    <Select
                                        labelId="days-open-label"
                                        id="days-open-select"
                                        name="daysOpen"
                                        placeholder="Select Days..."
                                        label="Days Open"
                                        defaultValue="Others"
                                        required
                                        {...register("daysOpen")}
                                    >
                                        <MenuItem value="Monday - Sunday">Monday - Sunday</MenuItem>
                                        <MenuItem value="Monday - Friday">Monday - Friday</MenuItem>
                                        <MenuItem value="Friday - Sunday">Friday - Sunday</MenuItem>
                                        <MenuItem value="Saturday - Sunday">Saturday - Sunday</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                </FormControl>
                                {daysOpenWatch === "Others" &&
                                    <TextField
                                        margin="dense"
                                        id="other-days-open"
                                        name="otherDaysOpen"
                                        label="Please specify the days"
                                        variant="filled"
                                        type="text"
                                        fullWidth
                                        required
                                        {...register("otherDaysOpen")}
                                    />
                                }
                                <Grid container justifyContent="flex-end" alignItems="flex-end">
                                    <Grid item>
                                        <DialogActions>
                                            <Button onClick={handleDialogClose}>Cancel</Button>
                                            <Button type="submit">Save</Button>
                                        </DialogActions>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </DialogContent>
                </Dialog>

                {selected && <PlaceInfoWindow restoDetails={selected} />}
            </GoogleMap>
        </div>
    )
}

export default Map
