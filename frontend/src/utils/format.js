const formatMemory = (mb) => {
    if (!mb) return 'N/A';
    if (mb >= 1024 * 1024) {
        return `${(mb / (1024 * 1024)).toFixed(1)} TB`;
    }
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
};

const formatStorage = (gb) => {
    if (!gb) return 'N/A';
    if (gb >= 1024 * 1024) {
        return `${(gb / (1024 * 1024)).toFixed(1)} PB`;
    }
    if (gb >= 1024) {
        return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${gb} GB`;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    } catch (error) {
        return dateString;
    }
};

export {
    formatMemory,
    formatStorage,
    formatDate,
}