import { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, DrawingManager, Rectangle, Circle } from '@react-google-maps/api';
import { Button, Fab, Typography, Snackbar, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, FormGroup, FormControlLabel, FormHelperText, Checkbox, Divider, List, ListItem, ListItemText, Grow } from '@material-ui/core';
import currentLocationPin from './../../assets/your_location_pin.png';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import RateReviewIcon from '@material-ui/icons/RateReview';
import NavigationIcon from '@material-ui/icons/Navigation';
import restoPin from './../../assets/restaurant_pin.png';
import logo from './../../assets/rc_logo.png';
import { getRestaurants } from './../../api/index';
import { useForm } from 'react-hook-form';
import useStyles from './styles';

const libraries = ["drawing", "directions", "geometry"];
const cebuCoordinates = { lat: 10.3157, lng: 123.8854 };

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

let directionsService;

const Map = () => {
    const classes = useStyles();
    const [restoPosition, setRestoPosition] = useState({});
    const [restoMarkers, setRestoMarkers] = useState([]);
    const [markersInBounds, setMarkersInBounds] = useState([]);
    const [markersPlaceholder, setMarkersPlaceholder] = useState([]);
    const [selected, setSelected] = useState(null);
    const [drawMode, setDrawMode] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState([]);
    const { register, handleSubmit, reset, watch, setValue } = useForm({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [placeInfoOpen, setPlaceInfoOpen] = useState(false);
    const [inBoundsMarkerInfoOpen, setInBoundsMarkerInfoOpen] = useState(false);
    const [directionsResult, setDirectionsResult] = useState(null);
    const [listToggleStatus, setListToggleStatus] = useState({
        directions: false,
        filters: false,
        drawing: false
    });
    const { directions, filters, drawing } = listToggleStatus;
    const [restoTypeFilter, setRestoTypeFilter] = useState({
        fineDining: true,
        casualDining: true,
        fastFood: true,
        cafe: true,
        unlimitedFood: true,
        others: true,
    });
    const { fineDining, casualDining, fastFood, cafe, unlimitedFood, others } = restoTypeFilter;
    const daysOpenWatch = watch("daysOpen");
    const directionOriginWatch = watch("directionOrigin");
    const directionDestinationWatch = watch("directionDestination");

    const [rectangle, setRectangle] = useState({});
    const [circle, setCircle] = useState({});

    useEffect(() => {
        const fetchRestaurantData = async () => {
            let markers = await getRestaurants();

            let sortedRestoData = markers.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            setMarkersPlaceholder(sortedRestoData);
            setRestoMarkers(sortedRestoData);
        }

        fetchRestaurantData();
    }, [])

    useEffect(() => {
        var restoTypeKeys = Object.keys(restoTypeFilter);

        var filteredTypes = restoTypeKeys.filter(function (key) {
            return restoTypeFilter[key]
        });

        var indexOf = (arr, q) => arr.findIndex(item => q.toLocaleLowerCase().replace(/\s/g, '') === item.toLowerCase());

        const filterRestoData = async () => {
            var filteredMarkers = markersPlaceholder.filter(function (resto) {
                return indexOf(filteredTypes, resto.type) > -1;
            });

            let sortedRestoData = filteredMarkers.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            setRestoMarkers(sortedRestoData);
        }

        filterRestoData();
    }, [restoTypeFilter, markersPlaceholder])

    const handleFiltersChange = (event) => {
        setRestoTypeFilter({
            ...restoTypeFilter,
            [event.target.name]: event.target.checked,
        });
    };

    const handleListItemChange = (listItem, listItemValue) => {
        let directionsVal = false;
        let filtersVal = false;
        let drawingVal = false;
        setDrawMode(false);
        setDirectionsResult(null);

        if (listItem === "directions" && !listItemValue) {
            directionsVal = true;
            filtersVal = false;
            drawingVal = false;
            clearMapDrawing();
        }

        if (listItem === "filters" && !listItemValue) {
            directionsVal = false;
            filtersVal = true;
            drawingVal = false;
            clearMapDrawing();
        }

        if (listItem === "drawing" && !listItemValue) {
            directionsVal = false;
            filtersVal = false;
            drawingVal = true;
        }

        setListToggleStatus({
            ...listToggleStatus,
            directions: directionsVal,
            filters: filtersVal,
            drawing: drawingVal
        });
    };

    const handleClose = () => {
        setSnackbarOpen(false);
    };

    const handleDialogClose = () => {
        reset();
        setDialogOpen(false);
    };

    const handlePlaceInfoClose = () => {
        setPlaceInfoOpen(false);
    };

    const handleInBoundsMarkerInfoClose = () => {
        setInBoundsMarkerInfoOpen(false);
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

                    if (directions) {
                        setValue('directionOrigin', pos.lat + "," + pos.lng);
                    }
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
                address: values.address,
                description: values.description,
                phone: values.phone,
                specialtyFood: values.specialtyFood,
                avgCustomer: values.avgCustomer,
                timeOpen: values.timeOpen,
                timeClose: values.timeClose,
                daysOpen: values.otherDaysOpen ? values.otherDaysOpen : values.daysOpen,
                dateCreated: `${phFormattedDate} ${phFormattedTime}`
            }];

            let sortedRestoData = updatedRestoData.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            setMarkersPlaceholder(sortedRestoData);
            setRestoMarkers(sortedRestoData);
            setDialogOpen(false);
            reset();
        } catch (error) {
            // setSigninFailed(true)
        }
    }, [restoMarkers, restoPosition, reset])

    const changeDirection = (origin, destination) => {
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResult(result);
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    }

    // Save resto information on state handler
    const handleGetDirections = useCallback(async (values) => {
        directionsService = new window.google.maps.DirectionsService();
        changeDirection(values.directionOrigin, values.directionDestination);
    }, [])

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
            <div className={classes.dialogTitle}>
                <Typography variant="h4" style={{ color: "white" }}>{restoDetails.name}</Typography>
                <Typography variant="subtitle1" style={{ color: "white" }}>{restoDetails.type}</Typography>
            </div>
            <DialogContent className={classes.dialogContent}>
                <br />
                <Typography variant="subtitle1"><LocationOnIcon className={classes.icon} /> {restoDetails.address}</Typography>
                <br />
                <DialogContentText id="alert-dialog-slide-description">{restoDetails.description}</DialogContentText>
                <br />
                <Grid container spacing={1} align="center">
                    <Grid item xs={4}>
                        <Typography variant="subtitle2"><b>Food Specialty:</b> {restoDetails.specialtyFood}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="subtitle2"><b>Phone:</b> {restoDetails.phone}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="subtitle2"><b>Customers/Day:</b> {restoDetails.avgCustomer}</Typography>
                    </Grid>
                </Grid>
                <br />
                <Grid container spacing={2} align="center">
                    <Grid item xs={6}>
                        <Typography variant="subtitle2"><b>Days Open:</b> {restoDetails.daysOpen}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2"><AccessTimeIcon className={classes.icon} /> {restoDetails.timeOpen} - {restoDetails.timeClose}</Typography>
                    </Grid>
                </Grid>
                <br /><hr />
                <Grid container>
                    <Grid item>
                        <Typography variant="subtitle1"><RateReviewIcon className={classes.icon} /> Reviews</Typography>
                    </Grid>
                    {restoDetails.reviews ? restoDetails.reviews.map((review) => (
                        <Grid container key={review.id} className={classes.review}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">{review.reviewerName}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.reviewText}>
                                    <b>Rating:</b> {review.rating}/5
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.reviewText}>{review.comment}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.reviewText} style={{ color: "grey" }}>
                                    {review.dateCreated}
                                </Typography>
                            </Grid>
                        </Grid>
                    ))
                        :
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography className={classes.reviewText}>No reviews</Typography>
                            </Grid>
                        </Grid>
                    }
                </Grid>
                <hr />
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                {/* <Button className={classes.dialogButtons} onClick={() => { handlePlaceInfoClose(); handleListItemChange("directions", false, restoDetails.lat + "," + restoDetails.lng); }}>Directions</Button> */}
                <Button className={classes.closeBtn} onClick={handlePlaceInfoClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )

    const MarkersInBoundsInfoWindow = ({ markersInBounds }) => (
        <Dialog
            open={inBoundsMarkerInfoOpen}
            TransitionComponent={TransitionDown}
            keepMounted
            onClose={handleInBoundsMarkerInfoClose}
            aria-describedby="alert-dialog-slide-description"
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                },
            }}
        >
            <div className={classes.dialogTitle}>
                <Typography variant="h4" style={{ color: "white" }}>Restaurants Within the Area</Typography>
                <Typography variant="subtitle1" style={{ color: "white" }}>Total: {markersInBounds.length}</Typography>
            </div>
            <DialogContent className={classes.dialogContent}>
                <Grid container>
                    {markersInBounds.length > 0 ? markersInBounds.map((resto) => (
                        <Grid container key={resto.id} className={classes.review}>
                            <Grid item xs={12}>
                                <Divider />
                                <Typography variant="subtitle1" style={{ marginTop: "10px" }}><b>{resto.name}</b> {resto.phone}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.reviewText}>{resto.address}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <br />
                                <Typography className={classes.reviewText}>{resto.description}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <br />
                                <Typography className={classes.reviewText}>
                                    {resto.daysOpen} | {resto.timeOpen} - {resto.timeClose}
                                </Typography>
                            </Grid>
                        </Grid>
                    ))
                        :
                        <Grid item xs={12}>
                            <Typography className={classes.reviewText}>No Restaurants Within the Area</Typography>
                        </Grid>
                    }
                </Grid>
                <hr />
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button className={classes.closeBtn} onClick={handleInBoundsMarkerInfoClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )

    const toggleDrawMode = () => {
        setDrawMode(!drawMode);
        clearMapDrawing();
        setListToggleStatus({
            ...listToggleStatus,
            directions: false,
            filters: false,
            drawing: false
        });
        !drawMode && setSnackbarOpen(!snackbarOpen);
    }

    const clearMapDrawing = () => {
        setRectangle({});
        setCircle({});
    }

    const panToLocation = useCallback((lat, lng) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, [])

    const onMapClick = useCallback((event, mode) => {
        let position = { lat: event.latLng.lat(), lng: event.latLng.lng() };

        if (mode === "directions") {
            setValue('directionOrigin', position.lat + "," + position.lng);
        }

        if (mode === "draw") {
            setRestoPosition(position);
            setDialogOpen(true);
        }
    }, [setValue])

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, [])

    if (loadError) return <h1>Error loading maps</h1>;
    if (!isLoaded) return <h1>Loading Maps</h1>;

    const checkMarkersInBounds = (shape) => {
        let inBoundMarkers = [];

        if (restoMarkers && Object.keys(circle).length !== 0 && shape === "circle") {
            restoMarkers.forEach((resto) => {
                var restaurantPosition = {
                    lat: () => { return resto.lat },
                    lng: () => { return resto.lng }
                };

                // let test = window.google.maps.geometry.spherical.computeDistanceBetween(circleCenter, restoPos);
                let distanceFromMarkerToCenter = window.google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), restaurantPosition);

                if (distanceFromMarkerToCenter < circle.getRadius()) {
                    inBoundMarkers.push(resto)
                }
            })
        } else if (restoMarkers && Object.keys(rectangle).length !== 0 && shape === "rectangle") {
            restoMarkers.forEach((resto) => {
                if (rectangle.getBounds().contains({ lat: resto.lat, lng: resto.lng })) {
                    inBoundMarkers.push(resto)
                }
            })
        }

        setInBoundsMarkerInfoOpen(true);
        setMarkersInBounds(inBoundMarkers)
    }

    return (
        <div className={classes.mapContainer}>
            <Grid container>
                <Grid item xs={10}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={14}
                        center={cebuCoordinates}
                        options={options}
                        onClick={(event) => { drawMode ? onMapClick(event, "draw") : directions && onMapClick(event, "directions") }}
                        onLoad={onMapLoad}
                    >
                        <Snackbar
                            ContentProps={{
                                classes: {
                                    root: classes.snackbar
                                }
                            }}
                            open={drawing}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "left"
                            }}
                            TransitionComponent={TransitionDown}
                            message="Drawing mode is now enabled. Pick an overlay above."
                            key={TransitionDown.name}
                        />
                        {drawing && <DrawingManager
                            options={{
                                drawingControl: true,
                                drawingControlOptions: {
                                    position: window.google.maps.ControlPosition.TOP_CENTER,
                                    drawingModes: [
                                        window.google.maps.drawing.OverlayType.CIRCLE,
                                        window.google.maps.drawing.OverlayType.RECTANGLE,
                                    ],
                                },
                                rectangleOptions: {
                                    strokeWeight: 2,
                                    clickable: false,
                                    editable: false,
                                    zIndex: 1,
                                    visible: true
                                },
                            }}
                            onRectangleComplete={(rectangle => {
                                setRectangle(rectangle);
                                rectangle.setMap(null);
                            })}
                            onCircleComplete={(circle => {
                                setCircle(circle);
                                circle.setMap(null);
                            })}
                            onUnmount={(drawingManager) => { }}
                        />}
                        {Object.keys(rectangle).length !== 0 && <Rectangle bounds={rectangle.getBounds()} />}
                        {Object.keys(circle).length !== 0 && <Circle center={circle.getCenter()} radius={circle.getRadius()} />}

                        {drawing && <Button
                            className={classes.clearDrawingBtn}
                            size="small"
                            onClick={() => clearMapDrawing()}
                        >
                            <Typography variant="subtitle1">
                                Clear Drawing
                            </Typography>
                        </Button>}

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
                            message="Add a restaurant by clicking the location on the map first."
                            key={TransitionDown.name}
                        />
                        <GetLocation panToLocation={panToLocation} />
                        {restoMarkers.map((marker) => {
                            return (<div key={marker.id}>
                                <Marker
                                    // onLoad={onMarkerLoad}
                                    animation={2}
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

                        {currentLocation &&
                            <Marker
                                // onLoad={onMarkerLoad}
                                animation={2}
                                position={{ lat: parseFloat(currentLocation.lat), lng: parseFloat(currentLocation.lng) }}
                                icon={{
                                    url: currentLocationPin,
                                    scaledSize: new window.google.maps.Size(30, 30),
                                    origin: new window.google.maps.Point(0, 0),
                                    anchor: new window.google.maps.Point(15, 15),
                                    labelOrigin: new window.google.maps.Point(15, -10)
                                }}
                                label={{
                                    text: currentLocation.name ? currentLocation.name : "",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: "#000",
                                }}
                                onClick={() => {
                                    setSelected(currentLocation)
                                }}
                            />
                        }

                        <Button
                            className={classes.drawBtn}
                            size="small"
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
                            <DialogTitle className={classes.dialogTitle}>Add Restaurant</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    NOTE: No servers are currently set up for this app. The restaurant data will not be saved on your next visit.
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
                                                <MenuItem value="Unlimited Food">Unlimited Food</MenuItem>
                                                <MenuItem value="Fast Food">Fast Food</MenuItem>
                                                <MenuItem value="Cafe">Cafe</MenuItem>
                                                <MenuItem value="Others">Others</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} md={6}>
                                                <TextField
                                                    margin="dense"
                                                    id="resto-address"
                                                    name="restoAddress"
                                                    label="Address"
                                                    placeholder="e.g. No. 1 Dr Jose P. Rizal St, Cebu City, Cebu"
                                                    variant="filled"
                                                    fullWidth
                                                    required
                                                    {...register("address")}
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={6}>
                                                <TextField
                                                    margin="dense"
                                                    id="phone"
                                                    name="phone"
                                                    label="Phone"
                                                    placeholder="e.g. (012) 345 6789"
                                                    variant="filled"
                                                    fullWidth
                                                    required
                                                    {...register("phone")}
                                                />
                                            </Grid>
                                        </Grid>
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
                                                    <Button className={classes.closeBtn} onClick={handleDialogClose}>Cancel</Button>
                                                    <Button className={classes.drawOnMapBtn} type="submit">Save</Button>
                                                </DialogActions>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {selected && <PlaceInfoWindow restoDetails={selected} />}
                        {markersInBounds && <MarkersInBoundsInfoWindow markersInBounds={markersInBounds} />}
                        {directions && directionsResult !== null && (
                            <DirectionsRenderer directions={directionsResult} />
                        )}
                    </GoogleMap>
                </Grid>

                <Grid item xs={2} className={classes.sidebar}>
                    <Grid container>
                        <Grid item xs={12} className={classes.sidebarTitle} align="center">
                            <Typography variant="h5">
                                <img className={classes.rcLogo} src={logo} alt="resto-cebu-logo" />
                                <b>Resto Cebu</b>
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <List component="nav" aria-label="mailbox folders">
                                <ListItem button onClick={() => handleListItemChange("directions", directions)}>
                                    <Typography variant="subtitle1">Directions to Restaurant</Typography>
                                </ListItem>
                                {directions && <Grow
                                    in={directions}
                                    style={{ transformOrigin: '0 0 0' }}
                                    {...(directions ? { timeout: 1000 } : {})}>
                                    <ListItem>
                                        <Grid item xs={12}>
                                            <form onSubmit={handleSubmit(handleGetDirections)}>
                                                <Grid container>
                                                    <TextField
                                                        autoFocus
                                                        margin="dense"
                                                        id="direction-origin"
                                                        name="directionOrigin"
                                                        value={directionOriginWatch ? directionOriginWatch : ""}
                                                        label="From"
                                                        inputProps={
                                                            { readOnly: true, }
                                                        }
                                                        InputProps={{ style: { fontSize: "10px" } }}
                                                        InputLabelProps={{ style: { fontSize: "15px" } }}
                                                        placeholder="Choose starting point by clicking on the map"
                                                        variant="filled"
                                                        fullWidth
                                                        required
                                                        {...register("directionOrigin")}
                                                    />
                                                    <FormHelperText style={{ fontSize: "10px" }}>To use your current location. Click the target icon on the map. You can click anywhere on the map if you want to change the location.</FormHelperText>

                                                    <FormControl fullWidth margin="dense">
                                                        <InputLabel id="destination-label" required>Destination</InputLabel>
                                                        <Select
                                                            labelId="destination-label"
                                                            id="direction-destination"
                                                            name="directionDestination"
                                                            placeholder="Destination"
                                                            label="Destination"
                                                            defaultValue={restoMarkers.length > 0 ? restoMarkers[0].lat + "," + restoMarkers[0].lng : "default"}
                                                            required
                                                            {...register("directionDestination")}
                                                        >
                                                            <MenuItem value="default" disabled>
                                                                Select a restaurant...
                                                            </MenuItem>
                                                            {restoMarkers.length > 0 &&
                                                                restoMarkers.map((resto) => {
                                                                    return (
                                                                        <MenuItem key={resto.id} value={resto.lat + "," + resto.lng} >
                                                                            {resto.name}&nbsp;<Typography variant="subtitle1" style={{ fontSize: "12px" }}>({resto.address})</Typography>
                                                                        </MenuItem>)
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                    <Grid container justifyContent="center" alignItems="center" style={{ marginTop: "15px", marginBottom: "10px" }}>
                                                        <Grid item>
                                                            <Button className={classes.directionGoBtn} type="submit" disabled={!directionOriginWatch || restoMarkers.length <= 0 || directionDestinationWatch === "default"}><NavigationIcon />Get Directions</Button>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </form>
                                        </Grid>
                                    </ListItem>
                                </Grow>}
                                <Divider />
                                <ListItem button onClick={() => handleListItemChange("filters", filters)}>
                                    <Typography variant="subtitle1">Restaurant Type</Typography>
                                </ListItem>
                                {filters && <Grow
                                    in={filters}
                                    style={{ transformOrigin: '0 0 0' }}
                                    {...(filters ? { timeout: 1000 } : {})}>
                                    <ListItem>
                                        <Grid className={classes.sidebarItem} item xs={12}>
                                            <Grid item xs={12}>
                                                <FormGroup>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox checked={fineDining} onChange={handleFiltersChange} color="primary" name="fineDining" />
                                                        }
                                                        label="Fine Dining"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox checked={casualDining} onChange={handleFiltersChange} color="primary" name="casualDining" />
                                                        }
                                                        label="Casual Dining"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox checked={unlimitedFood} onChange={handleFiltersChange} color="primary" name="unlimitedFood" />
                                                        }
                                                        label="Unlimited Food"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox checked={fastFood} onChange={handleFiltersChange} color="primary" name="fastFood" />
                                                        }
                                                        label="Fast Food"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox checked={cafe} onChange={handleFiltersChange} color="primary" name="cafe" />
                                                        }
                                                        label="Cafe"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox checked={others} onChange={handleFiltersChange} color="primary" name="others" />
                                                        }
                                                        label="Others"
                                                    />
                                                </FormGroup>
                                                <FormHelperText>Filters will reflect on the map</FormHelperText>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                </Grow>}
                                <Divider />
                                <ListItem button onClick={() => handleListItemChange("drawing", drawing)}>
                                    <Typography variant="subtitle1">Draw on Map</Typography>
                                </ListItem>
                                {drawing && <Grow
                                    in={drawing}
                                    style={{ transformOrigin: '0 0 0' }}
                                    {...(drawing ? { timeout: 1000 } : {})}>
                                    <ListItem>
                                        <Grid className={classes.sidebarItem} item xs={12}>
                                            <Grid item xs={12}>
                                                <FormHelperText>You can now draw circles and rectangles on the map using the overlay menu at the top.<br /><br />Click on the buttons below to show restaurant data located within the area of those shapes that you've created.<br /><br /></FormHelperText>
                                                <Grid item xs={12}>
                                                    <Button className={classes.drawOnMapBtn} onClick={() => checkMarkersInBounds("circle")}>Check Circle</Button>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Button className={classes.drawOnMapBtn} onClick={() => checkMarkersInBounds("rectangle")}>Check Rectangle</Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                </Grow>}
                                <Divider />
                            </List>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        </div >
    )
}

export default Map
