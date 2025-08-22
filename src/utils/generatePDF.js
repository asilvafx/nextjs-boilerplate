import { jsPDF } from 'jspdf';

export const generatePDF = (order) => {
    const doc = new jsPDF();

    // Parse address safely
    let address = {};
    try {
        if (typeof order.shipping_address === 'string') {
            address = JSON.parse(order.shipping_address);
        } else {
            address = order.shipping_address || {};
        }
    } catch (error) {
        console.error('Error parsing shipping address:', error);
        address = order.shipping_address || {};
    }

    // Parse items safely
    let items = [];
    try {
        if (typeof order.items === 'string') {
            items = JSON.parse(order.items);
        } else {
            items = order.items || [];
        }
    } catch (error) {
        console.error('Error parsing items:', error);
        items = order.items || [];
    }

    // Company Header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text("LOST-FOREVER", 20, 25);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("www.lost-forever.com", 20, 32);
    doc.text("Boutique de vêtements", 20, 37);

    // Header line
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);

    // Invoice title and details
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("FACTURE", 20, 60);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Facture N° ${order.uid || 'N/A'}`, 20, 70);
    doc.text(`Date: ${order.created_at || new Date().toLocaleDateString('fr-FR')}`, 20, 78);
    doc.text(`Statut: ${order.status || 'Confirmé'}`, 20, 86);

    // Payment method
    doc.text(`Mode de paiement: ${order.method || 'Carte bancaire'}`, 120, 70);

    // Customer Information
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("INFORMATIONS CLIENT", 20, 105);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nom: ${order.cst_name || 'N/A'}`, 20, 115);
    doc.text(`Email: ${order.cst_email || 'N/A'}`, 20, 122);

    if (address.phone) {
        doc.text(`Téléphone: ${address.phone}`, 20, 129);
    }

    // Shipping Information
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("ADRESSE DE LIVRAISON", 120, 105);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nom: ${order.cst_name || 'N/A'}`, 120, 115);

    if (address.street) {
        doc.text(`Adresse: ${address.street}`, 120, 122);
    }
    if (address.city || address.postalCode) {
        doc.text(`${address.postalCode || ''} ${address.city || ''}`, 120, 129);
    }
    if (address.country) {
        doc.text(`Pays: ${address.country}`, 120, 136);
    }

    // Items section
    let yPosition = 155;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("DÉTAIL DE LA COMMANDE", 20, yPosition);
    yPosition += 12;

    // Table headers
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("ARTICLE", 20, yPosition);
    doc.text("TAILLE", 90, yPosition);
    doc.text("PRIX U.", 120, yPosition);
    doc.text("QTÉ", 150, yPosition);
    doc.text("TOTAL", 175, yPosition);
    yPosition += 5;

    // Header line
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;

    // Items
    doc.setFont(undefined, 'normal');
    let subtotal = 0;

    if (items && items.length > 0) {
        items.forEach(item => {
            const itemTotal = (item.price * item.quantity);
            subtotal += itemTotal;

            // Handle long product names
            const productName = item.name || 'Produit';
            if (productName.length > 25) {
                doc.text(productName.substring(0, 22) + '...', 20, yPosition);
            } else {
                doc.text(productName, 20, yPosition);
            }

            doc.text(item.size || '-', 90, yPosition);
            doc.text(`€${(item.price || 0).toFixed(2)}`, 120, yPosition);
            doc.text(`${item.quantity || 1}`, 150, yPosition);
            doc.text(`€${itemTotal.toFixed(2)}`, 175, yPosition);
            yPosition += 10;
        });
    }

    // Totals section
    yPosition += 5;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 12;

    // Calculate costs
    const calculatedSubtotal = subtotal > 0 ? subtotal : parseFloat(order.amount || 0);
    const shippingCost = 5.99; // Your standard shipping cost
    const total = calculatedSubtotal + shippingCost;

    doc.setFontSize(10);
    doc.text(`Sous-total:`, 130, yPosition);
    doc.text(`€${calculatedSubtotal.toFixed(2)}`, 175, yPosition);
    yPosition += 8;

    doc.text(`Frais de port:`, 130, yPosition);
    doc.text(`€${shippingCost.toFixed(2)}`, 175, yPosition);
    yPosition += 8;

    doc.text(`TVA (20%):`, 130, yPosition);
    doc.text(`Incluse`, 175, yPosition);
    yPosition += 10;

    // Total line
    doc.setLineWidth(0.5);
    doc.line(130, yPosition, 190, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL:`, 130, yPosition);
    doc.text(`€${(order.amount || total.toFixed(2))}`, 175, yPosition);

    // Footer
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text(`Merci pour votre commande !`, 20, yPosition);
    doc.text(`ID de commande: ${order.uid}`, 20, yPosition + 8);

    // Company footer
    yPosition += 25;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Lost-Forever - Boutique en ligne de vêtements`, 20, yPosition);
    doc.text(`Pour toute question, contactez-nous à: contact@lost-forever.com`, 20, yPosition + 5);

    // Save the PDF
    const fileName = `facture-${order.uid || 'commande'}.pdf`;
    doc.save(fileName);
};
