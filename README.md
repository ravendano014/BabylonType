# BabylonType

Generate letters in BABYLON meshes.

### Basic-Usage

	Type  = BABYLONTYPE(scene, scale, "HirukoPro-Book");
	text  = new Type( 
	            "ABC",
	            {
	                "anchor": "center",
	                "letter-height": 50,
	                "color": "#1C3870",
	                "font-family": "HelveticaNeue-Medium",
	                "position": {
	                    "z": 20
	                }
	            }
	       );

&#9679; See playground example:
https://www.babylonjs-playground.com/#XWVXN9#7

### Superconstructor - BABYLONTYPE()

After this module is loaded, BABYLONTYPE is defined as a global function.  It is called with one to three parameters.
- **Scene** &nbsp; required
- **Scale** &nbsp; optional, default 1
- **Default font** &nbsp; optional, default HelveticaNeue Medium

A call to BABYLONTYPE returns a constructor, which can be used to insert 3-D text into the scene.  Call it "**Type**".

### Constructor - new Type()

new Type() is called with a string and an (optional) options parameter.&nbsp; The options conform roughly to normal BabylonJS structures and terminology.

	      FIELD                 DEFAULT
	    font-family             default-font
	    anchor                  left
	    letter-height           100
	    thickness               1
	    color                   #808080              # hits emissive, the only one i use
	    alpha                   1
	    position
	        x                   0
	        y                   0
	        z                   0
	    colors
	        diffuse             #F0F0F0
	        specular            #000000
	        ambient             #F0F0F0
	        emissive            color                # from option field 'color' above


**new Type()** builds a mesh with material that is inserted into the scene.&nbsp; This is a multi-step process with interim meshes and holes per letter.&nbsp;  These meshes are sucked into an SPS and then disposed.&nbsp; At the end, one mesh, one material and one SPS have been added to the scene.

**new Type()** also returns a type instance with useful methods.&nbsp; See below.

##### Instance

Each Type instance has methods to allow one to retrieve the BabylonJS objects or to get/set attributes of the SPS.

	   getSPS
	   getMesh
	   getMaterial
	   color                   # sets or gets color but no change to material
	   alpha                   # sets or gets alpha but no change to material
	   setColor                # set emissive color and change color value
	   setAlpha                # change value and material
	   overrideOpac            # change material but not value
	   resetOpac               # sets material to current value
	   dispose                 # not implemented yet



2) Scale

3) Default font

I probably don't do colors or orientation the way you want but there are easy methods to get the mesh and material and change them as you see fit.  Reminder:  new Type() returns an object and inserts an SPS into the scene.  Interim meshes are disposed.  This means that material, position and orientation may be changed with one action.  The whole string is turned into a mesh which will have uniform qualities.
##### POST /data/dre-data-_DNS_/messages
Body contains actual data in an object with a slightly strange format.  It has two fields:
- **"Body"** String of a JSON object with yer data.  If you parse that string (a parse on a parse) there are two fields, "cols" and "rows", which are both arrays.  Net effect is to emulate a table (like SQL, CSV or Excel).
- **"Mapping:"**  String of a JSON object that contains a mapping of the Predpol field names onto field names of the table, above.

_**DNS** is the unique name for that channel._
_**TYPE** is "data", "logs" or "commands"._


  // TYPE() - superconstructor - parameters
  //   ~ scene
  //   ~ scale                 - optional, default 1
  //   ~ default-font          - optional, default "HelveticaNeue-Medium"
  //
  // scale is multiplied everywhere:  letter-height, thickness and positions


  // new Type() parameters:
  //   ~ string
  //   ~ options               - optional object, see below
  
  // new Type() options object:
  // 
  //      FIELD                 DEFAULT
  //   font-family             default-font
  //   anchor                  left
  //   letter-height           100
  //   thickness               1
  //   color                   #808080              # hits emissive, the only one i use
  //   alpha                   1
  //   position
  //       x                   0
  //       y                   0
  //       z                   0
  //   colors
  //       diffuse             #F0F0F0
  //       specular            #000000
  //       ambient             #F0F0F0
  //       emissive            color                # from option field 'color' above

  // Type methods:
  //   getSPS
  //   getMesh
  //   getMaterial
  //   color                   # sets or gets color but no change to material
  //   alpha                   # sets or gets alpha but no change to material
  //   setColor                # set emissive color and change color value
  //   setAlpha                # change value and material
  //   overrideOpac            # change material but not value
  //   resetOpac               # sets material to current value



I am open to bug reports and suggestions but promising *nothing*.

Next week, I will have a more complete version.