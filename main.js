const fs = require('fs');

// Function to decode value from the given base to decimal
function decodeValue(base, value) {
    return parseInt(value, base);
}

// Function to add two polynomials
function addPolynomials(a, b) {
    const length = Math.max(a.length, b.length);
    const result = new Array(length).fill(0);
    for (let i = 0; i < length; i++) {
        result[i] = (a[i] || 0) + (b[i] || 0);
    }
    return result;
}

// Function to multiply two polynomials
function multiplyPolynomials(a, b) {
    const result = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            result[i + j] += a[i] * b[j];
        }
    }
    return result;
}

// Function to multiply a polynomial by a scalar
function multiplyPolynomialByScalar(a, scalar) {
    return a.map(coef => coef * scalar);
}

// Function to divide a polynomial by a scalar
function dividePolynomialByScalar(a, scalar) {
    return a.map(coef => coef / scalar);
}

// Function to evaluate a polynomial at a given x
function evaluatePolynomial(a, x) {
    return a.reduce((acc, coef, index) => acc + coef * Math.pow(x, index), 0);
}

// Function to perform Lagrange Interpolation and reconstruct the polynomial
function lagrangeInterpolation(points, k) {
    let polynomial = [0]; // Initialize polynomial as 0

    for (let i = 0; i < k; i++) {
        let L_i = [1]; // Start with polynomial "1"

        for (let j = 0; j < k; j++) {
            if (i !== j) {
                // (x - x_j) / (x_i - x_j)
                const numerator = [ -points[j].x, 1 ]; // Represents (x - x_j)
                const denominator = points[i].x - points[j].x;
                const term = dividePolynomialByScalar(numerator, denominator);
                L_i = multiplyPolynomials(L_i, term);
            }
        }

        // Multiply L_i by y_i
        const termPolynomial = multiplyPolynomialByScalar(L_i, points[i].y);

        // Add to the total polynomial
        polynomial = addPolynomials(polynomial, termPolynomial);
    }

    return polynomial;
}

// Function to read and parse JSON file
function readTestCase(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Function to process a test case and reconstruct the polynomial
function processTestCase(testCaseFile) {
    const input = readTestCase(testCaseFile);

    // Extracting the roots from input and decoding values
    let points = [];
    for (const key in input) {
        if (key !== "keys") {
            const x = parseInt(key); // x is the key
            const base = parseInt(input[key].base); // base of the value
            const y = decodeValue(base, input[key].value); // y is the decoded value
            points.push({ x, y });

            // Print decoded (x, y) for clarity
            console.log(`Root decoded: x = ${x}, y = ${y} (decoded from base ${base})`);
        }
    }

    // We need 'k' points to interpolate
    const k = input.keys.k;
    const selectedPoints = points.slice(0, k);

    // Perform Lagrange interpolation to reconstruct the polynomial
    const polynomial = lagrangeInterpolation(selectedPoints, k);

    // The constant term 'c' is the first coefficient
    const constantTerm = polynomial[0];

    console.log("\nReconstructed Polynomial Coefficients (lowest to highest degree):");
    polynomial.forEach((coef, index) => {
        console.log(`a_${index} = ${coef}`);
    });

    console.log("\nConstant term (c) of the polynomial:", constantTerm);

    return { points, polynomial, constantTerm };
}

// Function to find wrong points that don't fit on the curve
function findWrongPoints(points, polynomial, k) {
    const wrongPoints = [];
    for (let i = k; i < points.length; i++) {
        const { x, y } = points[i];
        const f_x = evaluatePolynomial(polynomial, x);
        // Check if this point fits the polynomial within a tolerance
        if (Math.abs(y - f_x) > 1e-3) { // Adjust tolerance as needed
            wrongPoints.push({ x, y, expected: f_x });
        }
    }
    return wrongPoints;
}

// MAIN EXECUTION
console.log("Processing Testcase 1...");
const testCase1Result = processTestCase('test.json');

console.log("\nProcessing Testcase 2...");
const testCase2Result = processTestCase('test2.json');

// Check for wrong points in Testcase 2
const wrongPoints = findWrongPoints(testCase2Result.points, testCase2Result.polynomial, testCase2Result.polynomial.length);
if (wrongPoints.length > 0) {
    console.log("\nWrong points in the curve (Testcase 2):");
    wrongPoints.forEach(point => {
        console.log(`Wrong Point: x = ${point.x}, y = ${point.y}, Expected y = ${point.expected.toFixed(4)}`);
    });
} else {
    console.log("\nNo wrong points found in the curve (Testcase 2).");
}
