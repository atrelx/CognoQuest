function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center">
            <div className="w-6 h-6 border-4 border-secondary dark:border-secondary-dark border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default LoadingSpinner;