class Heatmap {
    margin = {
        top: 30, right: 80, bottom: 180, left: 160
    }

    constructor(svg_id, heat_columns, heat_column_dubbed, tooltip, width = 320, height = 320) {
        this.svg_id = svg_id;
        this.heat_columns = heat_columns;
        this.heat_column_dubbed = heat_column_dubbed;
        this.tooltip = tooltip;
        this.width = width;
        this.height = height;
      
    }

    initialize() {
        this.svg = d3.select(this.svg_id);
        this.tooltip = d3.select(this.tooltip);
   
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleBand();

        this.xScale_dub = d3.scaleBand();
        this.yScale_dub = d3.scaleBand();


        this.caption = this.svg.append("text");

        this.legend_mark =  this.svg.append("g");
        this.legendWidth = this.height;
        this.legendHeight = 18;
        this.legendsvg = this.svg .append("g")

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.myColor = d3.scaleSequential()
                .interpolator(d3.interpolateInferno)
                .domain([-0.3,1]);

        this.myColor = d3
                .scaleLinear()
                .domain([-0.4, 0.0, 0.5 ,1.0])
                .range(["#03051A", "#6D1F56", "#EE523F", "#FAEBDD"])
                .interpolate(d3.interpolateHcl);

        this.xScale
                .range([ 0, this.width ])
                .domain(this.heat_columns)
                .padding(0.05); 
        this.yScale
                .range([this.height, 0 ])
                .domain(this.heat_columns.reverse())
                .padding(0.05);
        
        this.xScale_dub
                .range([ 0, this.width ])
                .domain(this.heat_column_dubbed)
                .padding(0.05); 
        this.yScale_dub
                .range([this.height, 0 ])
                .domain(this.heat_column_dubbed.reverse())
                .padding(0.05);

    }
    correlationCoefficient(X, Y, n)
        {
            
            let sum_X = 0, sum_Y = 0, sum_XY = 0;
            let squareSum_X = 0, squareSum_Y = 0;
            
            for(let i = 0; i < n; i++)
            {
                sum_X = sum_X + X[i];
                sum_Y = sum_Y + Y[i];    
                sum_XY = sum_XY + X[i] * Y[i];       
                squareSum_X = squareSum_X + X[i] * X[i];
                squareSum_Y = squareSum_Y + Y[i] * Y[i];
            }
            let corr = (n * sum_XY - sum_X * sum_Y)/
                    (Math.sqrt((n * squareSum_X -
                            sum_X * sum_X) * 
                                (n * squareSum_Y - 
                            sum_Y * sum_Y)));            
            return corr;
        }

    update(data, dept) {
        function getCol(matrix, col){
            var column = [];
            for(var i=0; i<matrix.length; i++){
               column.push(matrix[i][col]);
            }
            return column; 
         }


        const heat_data = [];
        for (var i = 0; i < this.heat_columns.length; i++) {
            for (var j = 0; j < this.heat_columns.length; j++) {
                var arr1 = getCol(data, this.heat_columns[i]);
                var arr2 = getCol(data, this.heat_columns[j]);
                var corr =  this.correlationCoefficient(arr1, arr2,  arr1.length);
                heat_data.push({"var1": this.heat_columns[i], "var2":this.heat_columns[j], "corr": corr});
            }
        }
        
        this.heats = this.container.selectAll("rect")
                .data(heat_data)
                .join("rect")
                .on("mouseover", (e, d) => {                    
                    this.tooltip.select("#heat-tooltips")
                        .html(`Corr: ${parseFloat(d.corr).toFixed(2)}`);
                    Popper.createPopper(e.target, this.tooltip.node(), {
                        placement: 'top',
                        modifiers: [
                            {
                                name: 'arrow',
                                options: {
                                    element: this.tooltip.select(".tooltip-arrow").node(),
                                },
                            },
                        ],
                    });
    
                    this.tooltip.style("display", "block");
                })
                .on("mouseout", (d) => {
                    this.tooltip.style("display", "none");
                });               
                

        this.heats.transition()
                .attr("x", d => this.xScale(d.var1) )
                .attr("y", d => this.yScale(d.var2) )
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", this.xScale.bandwidth() )
                .attr("height", this.yScale.bandwidth() )
                .style("fill", (d) => this.myColor(d.corr) )
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8);
 
        
        this.xAxis
                .style("font-size", 12)
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                .call(d3.axisBottom(this.xScale_dub).tickSize(0))
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-60)")
                .select(".domain").remove();

        this.yAxis
                .style("font-size", 12)
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                .call(d3.axisLeft(this.yScale_dub).tickSize(0))
                .select(".domain").remove();

        this.caption
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
                .attr("x", 10)
                .attr("y", -10)
                .attr("text-anchor", "left")
                .style("font-size", "22px")
                .text(dept ==="all" ? "Heatmap - Company":"Heatmap for Dept. "+ dept);

           
         // ! Creating the legend
        var linearGradient = this.svg
            .append("linearGradient")
            .attr("id", "linear-gradient");
        //Horizontal gradient
        linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
        //Append multiple color stops by using D3's data/enter step
        linearGradient
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#03051A" },
                { offset: "18%", color: "#6D1F56" },
                { offset: "53%", color: "#EE523F" },
                { offset: "100%", color: "#FAEBDD" },
            ])
            .enter()
            .append("stop")
            .attr("offset", function (d) {
                return d.offset;
            })
            .attr("stop-color", function (d) {
                return d.color;
            });
 
        
        //Color Legend container 
        this.legendsvg.attr("id", "legend")
                    .attr("transform", `translate(${this.margin.left+this.width+10}, ${this.margin.top+this.height})`)
                    .append("rect")
                    .attr("class", "legendRect")
                    .attr("width", this.legendWidth)
                    .attr("height", this.legendHeight)
                    .style("fill", "url(#linear-gradient)")
                    .attr("transform", "rotate(-90)") ; 
        //Draw the Rectangle
        var xScale2 = d3
                .scaleLinear()
                .range([0, this.legendWidth])
                .domain([1, -0.3]);

        this.legend_mark.style("font-size", 12)
                .attr("transform", `translate(${this.margin.left+this.width+10+this.legendHeight}, ${this.margin.top})`)
                .call(d3.axisRight(xScale2).tickSize(0))
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "1.8em")
                .attr("dy", ".15em")
                .select(".domain").remove();
    }
}
