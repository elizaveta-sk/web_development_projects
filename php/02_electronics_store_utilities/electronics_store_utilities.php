<?php
// 1a. Total with 10% sales tax (McGrath, 2021)
function calculateTotal($price, $quantity) {
    // Multiplies price by quantity, then adds 10% tax.
    return ($price * $quantity) * 1.10;
}

// 1b. Trim, capitalize each word, limit to 50 characters
function formatProductName($name) {
    // Removes outer spaces, capitalizes words, truncates past 50 characters.
    $name = ucwords(trim($name));
    return strlen($name) > 50 ? substr($name, 0, 50) : $name;
}

// 1c. Apply discount percentage
function calculateDiscount($price, $discountPercent) {
    // Subtracts the discount percentage from the price.
    return $price - ($price * $discountPercent / 100);
}

// ---------- RUN SECTION 1----------
// Calls each function with sample values.
// 1a test: 3 items at $20 each -> 60 + 10% tax = 66
$testPrice = 20;
$testQty = 3;
echo "Total for $testQty x $$testPrice (with 10% tax): $" . number_format(calculateTotal($testPrice, $testQty), 2) . "<br>";

// 1b test: extra spaces + lowercase, and a name longer than 50 characters
// Tests trimming and the 50-character limit.
$shortName = "   wireless gaming mouse   ";
$longName = "ultra high definition curved gaming monitor with adjustable stand and built in speakers";
echo "Formatted short name: '" . formatProductName($shortName) . "'<br>";
echo "Formatted long name: '" . formatProductName($longName) . "' (length: " . strlen(formatProductName($longName)) . ")<br>";

// 1c test: $200 item with 25% discount -> 150
$discountPrice = 200;
$discountPercent = 25;
echo "$$discountPrice with $discountPercent% off: $" . number_format(calculateDiscount($discountPrice, $discountPercent), 2) . "<br>";

// 2a. Remove duplicate products and sort by price ascending
// Nested arrays; Laptop appears twice.
$products = [
    ["name" => "Laptop", "price" => 1200],
    ["name" => "Mouse", "price" => 25],
    ["name" => "Laptop", "price" => 1200],
    ["name" => "Keyboard", "price" => 75]
];

// Drops duplicate rows.
$products = array_unique($products, SORT_REGULAR);
// Sorts by price, lowest first, using the spaceship operator.
usort($products, function($a, $b) {
    return $a["price"] <=> $b["price"];
});
echo "<h3>Products</h3>";
// Prints each product.
foreach ($products as $p) {
    echo formatProductName($p["name"]) . " - $" . $p["price"] . "<br>";
}

// 2b. Electronics category receives 10% discount
$inventory = [
    ["name" => "TV", "category" => "Electronics", "price" => 500],
    ["name" => "Chair", "category" => "Furniture", "price" => 100],
    ["name" => "Phone", "category" => "Electronics", "price" => 800]
];
// & passes items by reference so price changes persist.
foreach ($inventory as &$item) {
    // Only Electronics items get the 10% discount.
    if ($item["category"] === "Electronics") {
        $item["price"] = calculateDiscount($item["price"], 10);
    }
}
// Break reference to avoid accidental later modification.
unset($item);
echo "<h3>Updated Inventory</h3>";
// Loops through inventory and prints updated prices.
foreach ($inventory as $item) {
    echo $item["name"] . " - $" . $item["price"] . "<br>";
}

// 2c. Merge supplier inventories and remove duplicates
$supplierA = ["Laptop", "Mouse"];
$supplierB = ["Mouse", "Keyboard"];
// Merges arrays, removes duplicates, prints comma-separated.
$combined = array_unique(array_merge($supplierA, $supplierB));
echo "<h3>Combined Inventory</h3>" . implode(", ", $combined) . "<br>";

// 3a. Lowercase description, replace underscores, sanitize name
// Lowercases, swaps underscores for spaces.
$desc = "High_Quality_Leather_Wallet";
$desc = str_replace("_", " ", strtolower($desc));
$name = "  Leather@Wallet#  ";
// Removes every character that isn't a letter, digit, or space.
$name = preg_replace("/[^a-zA-Z0-9 ]/", "", $name);
echo "<h3>Text</h3>$name: $desc<br>";

// 3b. Description character count, word count, keyword check.
// strlen counts characters; str_word_count counts words; strpos checks keyword.
$text = "This is a high-quality leather wallet with RFID protection.";
echo "Characters: " . strlen($text) . "<br>";
echo "Words: " . str_word_count($text) . "<br>";
echo strpos($text, "leather") !== false ? "Keyword found<br>" : "Keyword not found<br>";

// 3c. Review preview, keyword position, concatenated message
// Shows first 20 characters as a preview.
$review = "Great product! Fast delivery and excellent service.";
echo substr($review, 0, 20) . "...<br>";
// Finds where 'excellent' starts (zero-based).
$pos = strpos($review, "excellent");
echo $pos !== false ? "Excellent starts at: $pos<br>" : "Not found<br>";
echo $review . " Thank you for your feedback!";
?>
