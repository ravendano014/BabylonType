//  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE 
//
//

define(
  ['./types/hirukopro-book','./types/helveticaneue-medium'],
  function(HPB,HNM){

    var scene,scale,FONTS,defaultFont,defaultColor,defaultOpac,naturalLetterHeight,curveSampleSize,Γ=Math.floor;

    FONTS                        = {};
    FONTS["HirukoPro-Book"]      = HPB;
    FONTS["HelveticaNeue-Medium"]= HNM;
    defaultFont                  = "HelveticaNeue-Medium";
    defaultColor                 = "#808080";
    defaultOpac                  = 1;
    curveSampleSize              = 6;
    naturalLetterHeight          = 1000;

    var Wrapper                  = function(scn,scl,ff){

      var proto;
      scene                      = scn;
      scale                      = tyN(scl) ? scl : 1 ;
      if(NNO(FONTS[ff])){defaultFont=ff}

      // Thansk Gijs, wherever you are
      BABYLON.Path2.prototype.addCurveTo = function(redX, redY, blueX, blueY){
        var points           = this.getPoints();
        var lastPoint        = points[points.length - 1];
        var origin           = new BABYLON.Vector3(lastPoint.x, lastPoint.y, 0);
        var control          = new BABYLON.Vector3(redX, redY, 0);
        var destination      = new BABYLON.Vector3(blueX, blueY, 0);
        var nb_of_points     = curveSampleSize;
        var curve            = BABYLON.Curve3.CreateQuadraticBezier(origin, control, destination, nb_of_points);
        var curvePoints      = curve.getPoints();
        for(var i=1; i<curvePoints.length; i++){
          this.addLineTo(curvePoints[i].x, curvePoints[i].y);
        }
      };

      // function Type(lttrs,font,elv,lt,ln,hite,thick,a,colr){
      function Type(lttrs,opt){
        var options              = NNO(opt) ? opt : { } ,
            position             = NNO(options.position) ? options.position : {} ,
            colors               = NNO(options.colors) ? options.colors : {} ,
            fontFamily           = setOption("font-family", supportedFont, defaultFont),
            fontSpec             = FONTS[fontFamily],
            anchor               = setOption("anchor", supportedAnchor, "left"),
            rawheight            = setOption("letter-height", PN, 100),
            rawThickness         = setOption("letter-thickness", PN, 1),
            basicColor           = setOption("color", NES, defaultColor),
            opac                 = setOption("alpha", Amp, defaultOpac),
            y                    = setPosition("y", tyN, 0),
            x                    = setPosition("x", tyN, 0),
            z                    = setPosition("z", tyN, 0),
            diffuse              = setColor("diffuse", NES, "#F0F0F0"),
            specular             = setColor("specular", NES, "#000000"),
            ambient              = setColor("ambient", NES, "#F0F0F0"),
            emissive             = setColor("emissive", NES, basicColor),
            letterScale          = Γ(0.3+scale*rawheight*1000000)/(naturalLetterHeight*1000000),
            thickness            = Γ(0.3+scale*rawThickness*1000000)/1000000,
            letters              = NES(lttrs)?lttrs:"",
            material             = makeMaterial(scene,letters,emissive,ambient,specular,diffuse,opac),
            meshes               = constructLetterPolygons(letters,fontSpec,0,0,0,letterScale,thickness,material),
            width                = Γ(0.3+meshes.width*1000000)/1000000,
            combo                = makeSPS(scene,meshes,material),
            sps                  = combo[0],
            mesh                 = combo[1];

        mesh.position.x          = scale*x-(anchor==="right"?width:anchor==="center"?width/2:0);
        mesh.position.y          = scale*y;
        mesh.position.z          = scale*z;

        this.getSPS              = function()  {return sps}
        this.getMesh             = function()  {return mesh};
        this.getMaterial         = function()  {return material};
        this.color               = function(c) {return NES(c)?color=c:color};
        this.opac                = function(o) {return Amp(o)?opac=o:opac};
        this.alpha               = function(o) {return Amp(o)?opac=o:opac};

        function setOption(field, tst, defalt) {
          return tst(options[field]) ? options[field] : defalt
        };
        function setColor(field, tst, defalt) {
          return tst(colors[field]) ? colors[field] : defalt
        };
        function setPosition(field, tst, defalt) {
          return tst(position[field]) ? position[field] : defalt
        }
      };

      proto                      = Type.prototype;


      proto.setColor             = function(color){
        var letters              = this,
            material             = this.getMaterial();
        if(NES(color)){
          material.emissiveColor = rgb2Bcolor3(letters.color(color));
        }
      };
      proto.setOpac              = function(opac){
        var letters              = this,
            material             = this.getMaterial();
        if(Amp(opac)){
          material.alpha         = letters.opac(opac)
        }
      };
      proto.overrideOpac         = function(opac){
        var letters              = this,
            material             = this.getMaterial();
        if(Amp(opac)){
          material.alpha         = opac
        }
      };
      proto.resetOpac            = function(){
        var letters              = this,
            material             = this.getMaterial();
        material.alpha           = letters.opac()
      };
      proto.setAlpha             = function(alpha){
        var letters              = this,
            material             = this.getMaterial();
        if(Amp(alpha)){
          material.alpha         = letters.alpha(alpha)
        }
      };
      proto.overrideAlpha        = function(alpha){
        var letters              = this,
            material             = this.getMaterial();
        if(Amp(alpha)){
          material.alpha         = alpha
        }
      };
      proto.resetAlpha           = function(){
        var letters              = this,
            material             = this.getMaterial();
        material.alpha           = letters.alpha()
      };
      proto.dispose              = function(){
        if(NNO(this.getMesh())){this.getMesh().dispose()}
      };

      return Type;
    };
    window.BABYLONTYPE           = Wrapper;
    window.TYPE                  = Wrapper;
    return Wrapper;

    function makeSPS(scene,meshes,material){
      var sps                    = new BABYLON.SolidParticleSystem("sps"+"test",scene, { } ),mesh;
      meshes.forEach(function(mesh){
        sps.addShape(mesh,1,{});
        mesh.dispose()
      });
      mesh                       = sps.buildMesh();
      mesh.material              = material;
      sps.setParticles();
      return [sps,mesh]
    };

    function constructLetterPolygons(letters,fontSpec,xOffset,yOffset,zOffset,letterScale,thickness,material){
      var xTra                   = 0,
          netMeshes              = [],i,j,k,combo,shapesList,holesList,shape,holes,hole,csgShape,csgHole,net;

      for(i=0;i<letters.length;i++){
        if(NNO(fontSpec[letters[i]])){
          combo                  = buildLetterMeshes(letters[i],i,fontSpec[letters[i]]);
          shapesList             = combo[0];
          holesList              = combo[1];
          for(j=0;j<shapesList.length;j++){
            shape                = shapesList[j];
            holes                = holesList[j];
            if(NEA(holes)){
              csgShape           = BABYLON.CSG.FromMesh(shape);
              for(k=0;k<holes.length;k++){
                hole             = holes[k];
                csgHole          = BABYLON.CSG.FromMesh(hole);
                csgShape         = csgShape.subtract(csgHole)
              }
              holes.forEach(function(h){h.dispose()});
              shape.dispose();
              netMesh            = csgShape.toMesh("Net-"+letters[i]+i+"-"+weeid(),material,scene);
            }else{
              netMesh            = shape
            }
            netMesh.material     = material;
            netMesh.position.y   = yOffset;
            netMeshes.push(netMesh)
          }
        }
      };
      netMeshes.width            = xTra;
      return netMeshes;

      function buildLetterMeshes(letter,index,spec){
        var offX                 = xOffset+xTra,
            offZ                 = zOffset,
            shapeCmdsLists       = tyA(spec.shapeCmds)?spec.shapeCmds:[],
            holeCmdsListsArray   = tyA(spec.holeCmds)?spec.holeCmds:[];

        xTra                     = xTra+spec.width*letterScale;

        return [shapeCmdsLists.map(meshFromCmdsList),holeCmdsListsArray.map(meshesFromCmdsListArray)];

        function meshesFromCmdsListArray(cmdsListArray){
          return cmdsListArray.map(function(d){return meshFromCmdsList(d,true)})
        };
        function meshFromCmdsList(cmdsList,noReverse){
          var firstCmd           = cmdsList[0],cmd,array,meshBuilder,mesh,csg,j,
              path               = new BABYLON.Path2(adjustX(firstCmd[0]),adjustZ(firstCmd[1]));

          for(j=1;j<cmdsList.length;j++){
            cmd                  = cmdsList[j];
            if(cmd.length===2){path.addLineTo(adjustX(cmd[0]),adjustZ(cmd[1]))}
            if(cmd.length===4){path.addCurveTo(adjustX(cmd[0]),adjustZ(cmd[1]),adjustX(cmd[2]),adjustZ(cmd[3]))}
          }
          array                  = path.getPoints().map(point2Vector);
          if(noReverse!==true){array.reverse()}
          meshBuilder            = new BABYLON.PolygonMeshBuilder("Type-"+letter+index+"-"+weeid(),array,scene);
          mesh                   = meshBuilder.build(true,thickness);
          return mesh;

          function point2Vector(point){
            return new BABYLON.Vector2(Γ(0.3+point.x*1000000)/1000000,Γ(0.3+point.y*1000000)/1000000)
          }
        };
        function adjustX(xVal){return offX+letterScale*xVal};
        function adjustZ(yVal){return offZ+letterScale*yVal}
      }
    };

    function makeMaterial(scene,letters,emissive,ambient,specular,diffuse,opac){
      var cm0                    = new BABYLON.StandardMaterial("type-material-"+letters+"-"+weeid(),scene);
      cm0.diffuseColor           = rgb2Bcolor3(diffuse);
      cm0.specularColor          = rgb2Bcolor3(specular);
      cm0.ambientColor           = rgb2Bcolor3(ambient);
      cm0.emissiveColor          = rgb2Bcolor3(emissive);
      cm0.alpha                  = opac;
      return cm0
    };
    function rgb2Bcolor3(rgb){
      rgb                        = rgb.replace("#","");
      return new BABYLON.Color3(convert(rgb.substring(0,2)),convert(rgb.substring(2,4)),convert(rgb.substring(4,6)));
      function convert(x){return Γ(1000*Math.max(0,Math.min((tyN(parseInt(x,16))?parseInt(x,16):0)/255,1)))/1000}
    };

    // *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-*
    // Boolean test functions
    function PN(mn)  { return typeof mn === "number" && !isNaN(mn) ? 0 < mn : false } ;
    function tyN(mn) { return typeof mn === "number" } ;
    function Amp(ma) { return typeof ma === "number" && !isNaN(ma) ? 0 <= ma && ma <= 1 : false } ;
    function NNO(mo) { return mo != null && typeof mo === "object" || typeof mo === "function" } ;
    function tyA(ma) { return ma != null && typeof ma === "object" && ma.constructor === Array } ; 
    function NEA(ma) { return ma != null && typeof ma === "object" && ma.constructor === Array && 0 < ma.length } ; 
    function NES(ms) {if(typeof(ms)=="string"){return(ms.length>0)}else{return(false)}} ;
    function supportedFont(ff){ return NNO(FONTS[ff]) } ;
    function supportedAnchor(a){ return a==="left"||a==="right"||a==="center" } ;
    function weeid() { return Math.floor(Math.random()*1000000) } ;
  }
);