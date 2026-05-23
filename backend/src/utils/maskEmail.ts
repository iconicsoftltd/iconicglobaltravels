const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    const visiblePart = localPart.slice(0, 2);
    return `${visiblePart}***@${domain}`;
}

export default maskEmail