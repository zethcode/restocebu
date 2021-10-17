import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
    paper: {
        padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100px',
    },
    mapContainer: {
        height: '85vh', width: '100%'
    },
    sidebar: {
        backgroundColor: 'whitesmoke',
        color: "black"
    },
    sidebarItem: {
        padding: "7px",
    },
    sidebarTitle: {
        backgroundColor: 'rgb(1, 1, 1, 0.9)',
        padding: '8px',
        color: "#fff"
    },
    checkbox: {
    },
    markerContainer: {
        position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 1, '&:hover': { zIndex: 2 },
    },
    pointer: {
        cursor: 'pointer',
    },
    locateBtn: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        border: 'none',
        zIndex: '10',
        backgroundColor: 'rgb(1, 1, 1, 0.7)',
        "&:hover": {
            backgroundColor: "rgb(1, 1, 1, 0.8)",
        },
    },
    locateIcon: {
        transform: 'scale(1.3)',
        color: 'rgb(255, 255, 255, 1)',
    },
    drawBtn: {
        paddingLeft: "15px",
        paddingRight: "15px",
        position: 'absolute',
        textTransform: 'none',
        bottom: '2rem',
        left: '1rem',
        border: 'none',
        zIndex: '10',
        backgroundColor: 'rgb(222, 170, 29, 0.8)',
        "&:hover": {
            backgroundColor: "rgb(222, 170, 29, 1)",
        },
        color: 'white'
    },
    drawBtnDisabled: {
        paddingLeft: "15px",
        paddingRight: "15px",
        position: 'absolute',
        textTransform: 'none',
        bottom: '2rem',
        left: '1rem',
        border: 'none',
        zIndex: '10',
        color: 'gray',
        backgroundColor: 'rgb(222, 170, 29, 0.5)',
    },
    snackbar: {
        backgroundColor: 'rgb(219, 93, 61, 1)',
    },
    dialogTitle: {
        backgroundColor: 'rgb(222, 170, 29, 1)',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '22px',
        paddingRight: '22px',
        color: "white"
    },
    dialogContent: {
        backgroundColor: 'rgb(255, 255, 255, 0.9)',
    },
    dialogActions: {
        backgroundColor: 'rgb(255, 255, 255, 0.9)',
        paddingBottom: '16px'
    },
    dialogButtons: {
        paddingLeft: "15px",
        paddingRight: "15px",
        backgroundColor: "#4A89F3",
        "&:hover": {
            backgroundColor: "rgb(222, 170, 29, 0.8)",
        },
        color: "white",
        borderRadius: "30px"
    },
    icon: {
        marginBottom: -6
    },
    review: {
        marginTop: "15px",
        marginBottom: "10px"
    },
    reviewText: {
        fontSize: "13px"
    },
    directionGoBtn: {
        paddingLeft: "10px",
        paddingRight: "15px",
        backgroundColor: "#4A89F3",
        "&:hover": {
            backgroundColor: "rgb(222, 170, 29, 0.9)",
        },
        color: "white",
        borderRadius: "30px"
    },
    drawOnMapBtn: {
        width: "100%",
        paddingLeft: "10px",
        paddingRight: "10px",
        marginTop: "15px",
        backgroundColor: "#4A89F3",
        "&:hover": {
            backgroundColor: "rgb(222, 170, 29, 0.9)",
        },
        color: "white",
    },
    clearDrawingBtn: {
        fontSize: '10px',
        paddingLeft: '15px',
        paddingRight: '15px',
        position: 'absolute',
        textTransform: 'none',
        bottom: '2rem',
        right: '5rem',
        border: 'none',
        zIndex: '10',
        backgroundColor: 'rgb(221, 75, 62, 0.7)',
        "&:hover": {
            backgroundColor: "rgb(221, 75, 62, 0.9)",
        },
        color: 'white'
    },
    closeBtn: {
        width: "20%",
        paddingLeft: "10px",
        paddingRight: "10px",
        marginTop: "15px",
        backgroundColor: "rgb(221, 75, 62, 0.9)",
        "&:hover": {
            backgroundColor: "rgb(222, 170, 29, 0.9)",
        },
        color: "white",
    }
}));