Qva.LoadScript("/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/Aster Plot/d3.js", function()
{
	Qva.LoadScript("/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/Aster Plot/d3-tip.js", function()
	{
		Qva.AddExtension('Aster Plot', function()
		{
			Qva.LoadCSS("/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/Aster Plot/style.css");
			
			this.Element.innerHTML="";
			var html = "";
			_this = this;
			var sliceStart = 0;
			
			var labels = ["Dimension","AngleWeight","Radius","FillColor","ReferenceLine1","ReferenceLine2"];
		
			this.Data.SetPagesizeY(this.Data.TotalSize.y);
			this.Data.SetPagesizeX(this.Data.TotalSize.x);
			
			/*BEGIN build_json_table*/
			var jsonCombined="";
			var row = 0;
			var col = 0;
			
			/*loop through x axis*/
			for (var rows = 0; rows < this.Data.TotalSize.y; rows++)
			{
				jsonCombined += "{";
				//Loop through y axis
				for (var cols = 0; cols < this.Data.TotalSize.x; cols++) 
				{
					//jsonCombined += '"Column' + cols + '":';
					jsonCombined += '"' + labels[cols] + '":';
					jsonCombined += '"' + this.Data.Rows[rows][cols].text+'" ,';
				}
				jsonCombined += "}";
			}

			//format table
			jsonCombined = 
				//'{"Results" : [\n'+
				"[" +
					jsonCombined.replace(/,}/g,"}").replace(/}{/g,"},{") 
				+ "]"
				//+ '\n]}'
				;

			//validation of table - can comment this out
			//alert(jsonCombined);
			
			jsonData = jQuery.parseJSON(jsonCombined);
			
			/*END build_json_table*/	
			
			/*BEGIN LOAD CHART*/
			var margin = {top: 10, right: 30, bottom: 10, left: 30};
			var width = this.GetWidth();// - margin.left - margin.right;//960 - margin.left - margin.right,
			var height = this.GetHeight();// - margin.top - margin.bottom;//500 - margin.top - margin.bottom;
			var radius = Math.min(width,height)/2
			var innerRadius = 0;
			
			var pie = d3.layout.pie()
				.sort(null)
				.value(function(d){return d.width;});

			var tip = d3.tip()
				.attr('class','d3-tip')
				.offset([0,0])
				.html(function(d){
					return d.data.Dimension + ": <span style = 'color:orangered'>" + d.data.Radius + "</span>";
					//return d.data.label + ": <span style = 'color:orangered'>" + d.data.score + "</span>";
				});
			
			//Draws individual filled arcs for pie slices
			var arc = d3.svg.arc()
				.innerRadius(innerRadius)
				.outerRadius(function(d){
					return d.data.Radius/10 * radius;
				})
				.startAngle(function(d){
					return sliceStart * (Math.PI/180);
				})
				.endAngle(function(d){
					sliceStart += (d.data.AngleWeight * 360);
					return (sliceStart) * (Math.PI/180);
				});
			
			//Draws outline of entire pie
			var outlineArc = d3.svg.arc()
				.innerRadius(innerRadius)
				.outerRadius(radius)
				.startAngle(0)
				.endAngle(360 * (Math.PI/180));
				
			var referenceArc1 = d3.svg.arc()
				.innerRadius(function(d){
					return d.data.ReferenceLine1/10 * radius;
				})
				.outerRadius(function(d){
					return d.data.ReferenceLine1/10 * radius;
				})
				.startAngle(0)
				.endAngle(360 * (Math.PI/180))
			;

			var referenceArc2 = d3.svg.arc()
				.innerRadius(function(d){
					return d.data.ReferenceLine2/10 * radius;
				})
				.outerRadius(function(d){
					return d.data.ReferenceLine2/10 * radius;
				})
				.startAngle(0)
				.endAngle(360 * (Math.PI/180))
			;
			
			var svg = d3.select(this.Element).append("svg")
				.attr("width",width)
				.attr("height",height)
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
				.attr("class","svg")
			;

			svg.call(tip);

			d3.json(jsonData,function()
			{
				jsonData.forEach(function(d) {
					d.Dimension = d.Dimension;
					d.AngleWeight = +d.AngleWeight;
					d.Radius = +d.Radius;
					d.FillColor = d.FillColor;
					d.ReferenceLine1 = +d.ReferenceLine1;
					d.ReferenceLine2 = +d.ReferenceLine2;
				});
				
				var outerPath = svg.selectAll(".referenceArc1")
						.data(pie(jsonData))
					.enter().append("path")
						.attr("fill","none")
						.attr("stroke","red")
						.style("stroke-dasharray",("5,5"))
						.style("stroke-width",".2")
						.attr("class","referenceArc1")
						.attr("d",referenceArc1)
				;

				var outerPath = svg.selectAll(".referenceArc2")
						.data(pie(jsonData))
					.enter().append("path")
						.attr("fill","none")
						.attr("stroke","green")
						.style("stroke-dasharray",("5,5"))
						.style("stroke-width",".2")
						.attr("class","referenceArc2")
						.attr("d",referenceArc2)
				;
				
				var path = svg.selectAll(".solidArc")
						.data(pie(jsonData))
					.enter().append("path")
						.attr("fill",function(d) {
							return d.data.FillColor;
						})
						.attr("class", "solidArc")
						.attr("stroke", "gray")
						.style("stroke-width",".5")
						.attr("d", arc)
						.on('mouseover', tip.show)
						.on('mouseout', tip.hide)
//						.on('click',function(d){
//							_this.Data.SearchColumn(0,d.data.Dimension,true);
//							return true;
//						})
				;
/*				
				var outerPath = svg.selectAll(".outlineArc")
						.data(pie(jsonData))
					.enter().append("path")
						.attr("fill","none")
						.attr("stroke","gray")
						.style("stroke-width",".3")
						.attr("class","outlineArc")
						.attr("d",outlineArc)
				;
*/				
/*					var score = 
					data.reduce(function(a,b) {
						//console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
						return a + (b.score * b.weight);
					},0) /
					data.reduce(function(a,b){
						return a + b.weight;
					},0)
				;
				
				svg.append("svg:text")
					.attr("class" , "aster-score")
					.attr("dy", ".35em")
					.attr("text-anchor", "middle")
					.text(Math.round(score))
				;*/
			});
			
			/*END LOAD CHART*/
			
//				alert("ended");

		}, true);
	});
});
//});