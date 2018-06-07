//  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE  BABYLONTYPE 
//
//

define(
  ['./types/hirukopro-book','./types/helveticaneue-medium','./types/comicsans-normal'],

  // *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-*
  // This function loads the specific type-faces and returns the superconstructor
  // It also assigns the superconstructor to global variable 'BABYLONTYPE'

  function(HPB,HNM,CSN){

    var scene,FONTS,defaultColor,defaultOpac,naturalLetterHeight,curveSampleSize,Γ=Math.floor;

    FONTS                        = {};
    FONTS["HirukoPro-Book"]      = HPB;
    FONTS["HelveticaNeue-Medium"]= HNM;
    FONTS["Helvetica"]           = HNM;
    FONTS["Arial"]               = HNM;
    FONTS["sans-serif"]          = HNM;
    FONTS["Comic"]               = CSN;
    FONTS["comic"]               = CSN;
    FONTS["ComicSans"]           = CSN;
    defaultColor                 = "#808080";
    defaultOpac                  = 1;
    curveSampleSize              = 6;                                 // Exposing this or making it dynamic might optimize performance by reducing vertices
    naturalLetterHeight          = 1000; 

    // *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-*
    //  SUPERCONSTRUCTOR  SUPERCONSTRUCTOR  SUPERCONSTRUCTOR 
    // Parameters:
    //   ~ scene
    //   ~ scale
    //   ~ default font
    //
    var Wrapper                  = function(scn,scl,ff){

      var proto,defaultFont,scale,meshOrigin,preferences;

      if(NNO(scl)){
        preferences              = scl
      }else{
        preferences              = { defaultFont: ff , scale: scl }
      }
      defaultFont                = NNO(FONTS[preferences.defaultFont])?preferences.defaultFont:"HelveticaNeue-Medium";
      scale                      = tyN(preferences.scale)?preferences.scale:1;
      meshOrigin                 = preferences.meshOrigin==="fontOrigin"||preferences.meshOrigin==="letterCenter"?preferences.meshOrigin:"fontOrigin";
      scene                      = scn;

      // Thanks Gijs, wherever you are
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


      // *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-*
      //  CONSTRUCTOR  CONSTRUCTOR  CONSTRUCTOR  CONSTRUCTOR
      // Called with 'new'
      // Parameters:
      //   ~ letters
      //   ~ options
      //
      function Type(lttrs,opt){
        var options              = NNO(opt) ? opt : { } ,
            position             = setOption("position", NNO, {}),
            colors               = setOption("colors", NNO, {}),
            fontFamily           = setOption("font-family", supportedFont, defaultFont),
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
            fontSpec             = FONTS[fontFamily],
            letterScale          = round(scale*rawheight/naturalLetterHeight),
            thickness            = round(scale*rawThickness),
            letters              = NES(lttrs) ? lttrs : "" ,
            material             = makeMaterial(scene, letters, emissive, ambient, specular, diffuse, opac),
            meshes               = constructLetterPolygons(letters, fontSpec, 0, 0, 0, letterScale, thickness, material),
            offsetX              = anchor==="right"?(0-meshes.width):anchor==="center"?(0-meshes.width/2):0,
            letterBoxes          = meshes.letterBoxes,
            combo                = makeSPS(scene, meshes, material),
            sps                  = combo[0],
            mesh                 = combo[1];

        mesh.position.x          = scale*x+offsetX;
        mesh.position.y          = scale*y;
        mesh.position.z          = scale*z;

        this.getSPS              = function()  {return sps}
        this.getMesh             = function()  {return mesh};
        this.getMaterial         = function()  {return material};
        this.getOffsetX          = function()  {return offsetX};
        this.getLetterBoxes      = function()  {return letterBoxes};
        this.color               = function(c) {return NES(c)?color=c:color};
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
        var material             = this.getMaterial();
        if(NES(color)){
          material.emissiveColor = rgb2Bcolor3(this.color(color));
        }
      };
      proto.setAlpha             = function(alpha){
        var material             = this.getMaterial();
        if(Amp(alpha)){
          material.alpha         = this.alpha(alpha)
        }
      };
      proto.overrideAlpha        = function(alpha){
        var material             = this.getMaterial();
        if(Amp(alpha)){
          material.alpha         = alpha
        }
      };
      proto.resetAlpha           = function(){
        var material             = this.getMaterial();
        material.alpha           = this.alpha()
      };
      proto.getLetterCenter      = function(ix){
        var lB                   = this.getLetterBoxes()[ix];
        if(tyA(lB)){
          return new BABYLON.Vector2(round((lB[0]+lB[1])/2+this.getOffsetX()),round((lB[2]+lB[3])/2))
        }
      }
      proto.dispose              = function(){
        if(NNO(this.getMesh())){this.getMesh().dispose()}
      };

      return Type;
    };
    window.BABYLONTYPE           = Wrapper;
    window.TYPE                  = Wrapper;
    return Wrapper;

    function makeSPS(scene,meshes,material,_sps){
      var sps,mesh;
      if(meshes.length){
        sps                      = new BABYLON.SolidParticleSystem("sps"+"test",scene, { } );
        meshes.forEach(function(mesh){
          sps.addShape(mesh, 1, {});
          mesh.dispose()
        });
        mesh                     = sps.buildMesh();
        mesh.material            = material;
        sps.setParticles()
      }
      return [sps,mesh]
    };

    function constructLetterPolygons(letters, fontSpec, xOffset, yOffset, zOffset, letterScale, thickness, material){
      var letterOrigin           = 0,
          lettersMeshes          = [],
          letterBoxes            = new Array(letters.length),letter,letterSpec,i,j,k,lists,shapesList,holesList,shape,holes,csgShape,letterMesh,letterMeshes;

      for(i=0;i<letters.length;i++){
        letter                   = letters[i];
        letterSpec               = fontSpec[letter];
        if(NNO(letterSpec)){
          lists                  = buildLetterMeshes(letter, i, letterSpec);
          shapesList             = lists[0];
          holesList              = lists[1];
          letterMeshes           = [];
          for(j=0;j<shapesList.length;j++){
            shape                = shapesList[j];
            holes                = holesList[j];
            if(NEA(holes)){
              letterMesh         = punchHoles(shape,holes,letter,i)
            }else{
              letterMesh         = shape
            }
            letterMeshes.push(letterMesh)
          }
          if(letterMeshes.length){lettersMeshes.push(merge(letterMeshes))}
        }
      };
      lettersMeshes.width        = round(letterOrigin);
      lettersMeshes.letterBoxes  = letterBoxes;
      return lettersMeshes;

      // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
      // A letter may have one or more shapes and zero or more holes
      // The shapeCmds is an array of shapes
      // The holeCmds is an array of array of holes (since one shape 'B' may have multiple holes)
      // The arrays must line up so holes have the same index as the shape they subtract from
      // '%' is the best example since it has three shapes and two holes
      // 
      // For mystifying reasons, the holeCmds (provided by the font) must be reversed
      // from the original order and the shapeCmds must *not* be reversed
      // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

      function buildLetterMeshes(letter,index,spec){
        var offX                 = xOffset+letterOrigin,
            offZ                 = zOffset,
            shapeCmdsLists       = tyA(spec.shapeCmds) ? spec.shapeCmds : [],
            holeCmdsListsArray   = tyA(spec.holeCmds) ? spec.holeCmds : [];

        letterBoxes[index]       = [adjustX(spec.xMin), adjustX(spec.xMax), adjustZ(spec.yMin), adjustZ(spec.yMax)];
        letterOrigin             = letterOrigin+spec.width*letterScale;

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
        };
        function adjustX(xVal){return round(offX+letterScale*xVal)};
        function adjustZ(yVal){return round(offZ+letterScale*yVal)}
      };

      // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
      // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
      function punchHoles(shape,holes,letter,i){
        var csgShape             = BABYLON.CSG.FromMesh(shape);
        for(var k=0; k<holes.length; k++){
          csgShape               = csgShape.subtract(BABYLON.CSG.FromMesh(holes[k]))
        }
        holes.forEach(function(h){h.dispose()});
        shape.dispose();
        return csgShape.toMesh("Net-"+letter+i+"-"+weeid())
      };

      // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
      // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
      function merge(arrayOfMeshes){
        if(arrayOfMeshes.length===1){
          return arrayOfMeshes[0]
        }else{
          return BABYLON.Mesh.MergeMeshes(arrayOfMeshes,true)
        }
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

    // *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-*
    // Conversion functions
    function rgb2Bcolor3(rgb){
      rgb                        = rgb.replace("#","");
      return new BABYLON.Color3(convert(rgb.substring(0,2)),convert(rgb.substring(2,4)),convert(rgb.substring(4,6)));
      function convert(x){return Γ(1000*Math.max(0,Math.min((tyN(parseInt(x,16))?parseInt(x,16):0)/255,1)))/1000}
    };
    function point2Vector(point){
      return new BABYLON.Vector2(round(point.x),round(point.y))
    };

    // *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-* *-*=*  *=*-*
    // Boolean test functions
    function PN(mn)   { return typeof mn === "number" && !isNaN(mn) ? 0 < mn : false } ;
    function tyN(mn)  { return typeof mn === "number" } ;
    function Amp(ma)  { return typeof ma === "number" && !isNaN(ma) ? 0 <= ma && ma <= 1 : false } ;
    function NNO(mo)  { return mo != null && typeof mo === "object" || typeof mo === "function" } ;
    function tyA(ma)  { return ma != null && typeof ma === "object" && ma.constructor === Array } ; 
    function NEA(ma)  { return ma != null && typeof ma === "object" && ma.constructor === Array && 0 < ma.length } ; 
    function NES(ms)  {if(typeof(ms)=="string"){return(ms.length>0)}else{return(false)}} ;
    function supportedFont(ff){ return NNO(FONTS[ff]) } ;
    function supportedAnchor(a){ return a==="left"||a==="right"||a==="center" } ;
    function weeid()  { return Math.floor(Math.random()*1000000) } ;
    function round(n) { return Γ(0.3+n*1000000)/1000000 }
  }
);