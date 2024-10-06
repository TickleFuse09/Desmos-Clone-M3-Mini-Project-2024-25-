document.getElementById('plot-button').addEventListener('click', function() {
    var equations = document.getElementById('equation-input').value.split('\n').map(eq => eq.trim());
    plotEquations(equations);
});

function plotEquations(equations) {
    try {
        var traces = [];
        var intersections = [];

        equations.forEach((equation, index) => {
            equation = equation.replace(/(\d)([a-zA-Z])/g, "$1*$2"); // 2x -> 2*x
            equation = equation.replace(/([a-zA-Z])(\d)/g, "$1*$2"); // x2 -> x*2
            equation = equation.replace(/\^/g, "**"); // Replace ^ with ** for exponentiation

            // Map trigonometric functions
            equation = equation.replace(/sin/g, "Math.sin");
            equation = equation.replace(/cos/g, "Math.cos");
            equation = equation.replace(/tan/g, "Math.tan");
            equation = equation.replace(/log/g, "Math.log10"); // Log base 10
            equation = equation.replace(/ln/g, "Math.log"); // Natural log

            // Create a new function with 'x' as the argument and evaluate the equation
            var expression = new Function('x', `return ${equation};`);

            var xValues = [];
            var yValues = [];

            for (var x = -10; x <= 10; x += 0.1) {
                xValues.push(x);
                var y = expression(x);
                yValues.push(y);
            }

            traces.push({
                x: xValues,
                y: yValues,
                mode: 'lines',
                type: 'scatter',
                name: `Equation ${index + 1}`
            });
        });

        // Plot the equations
        Plotly.newPlot('graph', traces);

        // Find intersections
        findIntersections(equations);
    } catch (error) {
        alert('Invalid equation. Please enter a valid equation.');
        console.error(error); // Log the error for debugging
    }
}

function findIntersections(equations) {
    var intersections = [];
    if (equations.length < 2) {
        document.getElementById('intersections').innerHTML = '';
        return;
    }

    for (let i = 0; i < equations.length - 1; i++) {
        for (let j = i + 1; j < equations.length; j++) {
            let expression1 = new Function('x', `return ${convertToJS(equations[i])};`);
            let expression2 = new Function('x', `return ${convertToJS(equations[j])};`);
            for (let x = -10; x <= 10; x += 0.1) {
                let y1 = expression1(x);
                let y2 = expression2(x);
                if (Math.abs(y1 - y2) < 0.1) {
                    intersections.push({x: x, y: (y1 + y2) / 2, eq1: i + 1, eq2: j + 1});
                }
            }
        }
    }

    // Display intersections
    if (intersections.length > 0) {
        var intersectionsHTML = 'Intersections:<br>' + intersections.map(pt => 
            `x: ${pt.x.toFixed(2)}, y: ${pt.y.toFixed(2)} (Equation ${pt.eq1} and Equation ${pt.eq2})`
        ).join('<br>');
        document.getElementById('intersections').innerHTML = intersectionsHTML;
    } else {
        document.getElementById('intersections').innerHTML = 'No intersections found.';
    }
}

function convertToJS(equation) {
    return equation.replace(/(\d)([a-zA-Z])/g, "$1*$2")
                   .replace(/([a-zA-Z])(\d)/g, "$1*$2")
                   .replace(/\^/g, "**")
                   .replace(/sin/g, "Math.sin")
                   .replace(/cos/g, "Math.cos")
                   .replace(/tan/g, "Math.tan")
                   .replace(/log/g, "Math.log10")
                   .replace(/ln/g, "Math.log");
}
