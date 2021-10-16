import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
    paper: {
        padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100px',
    },
    mapContainer: {
        height: '85vh', width: '100%'
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
    },
    snackbar: {
        backgroundColor: 'rgb(219, 93, 61, 1)',
    },
    dialogTitle: {
        backgroundColor: 'rgb(222, 170, 29, 1)',
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
    }
}));