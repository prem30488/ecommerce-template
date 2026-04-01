// Simple Eclat algorithm implementation for finding frequently bought together items
export const findFrequentlyBoughtTogether = (currentProduct, allProducts, minSupport = 0.1) => {
    // Mock transaction data - in a real app, this would come from purchase history
    const mockTransactions = generateMockTransactions(allProducts, currentProduct);

    // Convert transactions to vertical format (item -> transaction IDs)
    const verticalFormat = {};
    mockTransactions.forEach((transaction, transactionId) => {
        transaction.forEach(itemId => {
            if (!verticalFormat[itemId]) {
                verticalFormat[itemId] = [];
            }
            verticalFormat[itemId].push(transactionId);
        });
    });

    // Find items that appear with the current product
    const currentProductTransactions = verticalFormat[currentProduct.id] || [];
    const coOccurringItems = {};

    // Calculate support for each item with current product
    Object.keys(verticalFormat).forEach(itemId => {
        if (itemId !== currentProduct.id.toString()) {
            const itemTransactions = verticalFormat[itemId];
            const intersection = currentProductTransactions.filter(id => itemTransactions.includes(id));
            const support = intersection.length / mockTransactions.length;

            if (support >= minSupport) {
                coOccurringItems[itemId] = {
                    support,
                    confidence: intersection.length / currentProductTransactions.length,
                    item: allProducts.find(p => p.id.toString() === itemId)
                };
            }
        }
    });

    // Sort by support and return top items
    return Object.values(coOccurringItems)
        .filter(item => item.item)
        .sort((a, b) => b.support - a.support)
        .slice(0, 4)
        .map(item => item.item);
};

// Generate mock transaction data for demonstration
function generateMockTransactions(allProducts, currentProduct) {
    const transactions = [];
    const numTransactions = 100;

    for (let i = 0; i < numTransactions; i++) {
        const transaction = [];

        // Always include current product in some transactions
        if (Math.random() < 0.3) {
            transaction.push(currentProduct.id.toString());

            // Add 1-3 related items
            const availableItems = allProducts.filter(p => p.id !== currentProduct.id);
            const numItems = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < numItems && availableItems.length > 0; j++) {
                const randomIndex = Math.floor(Math.random() * availableItems.length);
                const selectedItem = availableItems.splice(randomIndex, 1)[0];
                transaction.push(selectedItem.id.toString());
            }
        } else {
            // Random transaction without current product
            const numItems = Math.floor(Math.random() * 4) + 1;
            const shuffled = [...allProducts].sort(() => 0.5 - Math.random());

            for (let j = 0; j < numItems && j < shuffled.length; j++) {
                transaction.push(shuffled[j].id.toString());
            }
        }

        transactions.push([...new Set(transaction)]); // Remove duplicates
    }

    return transactions;
}
