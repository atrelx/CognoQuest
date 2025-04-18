import { ToastContainer } from 'react-toastify';
import { useTheme } from '../providers/ThemeProvider';

function ThemedToastContainer() {
    const { theme } = useTheme();

    return (
        <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme}
            toastStyle={{
                fontSize: '16px',
                padding: '16px',
                minHeight: '70px',
                maxWidth: '400px'
            }}
        />
    );
}

export default ThemedToastContainer;