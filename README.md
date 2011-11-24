
![AMPlified Search](https://img.skitch.com/20111123-q9jkpxbeermhddk1juusw7j6p2.png "AMPlified Search")
#AMPlified Search for Google

The AMPS extension is an prototype extension for Google Chrome that amplifies search results by identifying learning resources by adding available standards alignment data and usage information found in Learning Registry.

Installing the binary form is the quickest way to try out.  Be warned, this is a prototype. The services backing this plugin may become temporarily unavailable or cease to exist in the future, however, we will make every effort to maintain them as long as we can.  If for some reason we must terminate support, the control box will indicate that the plugin has expired, and you should uninstall it at that point.

###SCREENSHOTS

<a href="https://skitch.com/jimklo/gmby9/demo-standards-alignment"><img width="600" src="https://img.skitch.com/20111123-fe1xwwmp4s17qwew1kkqytiqj5.medium.jpg" alt="demo-standards-alignment" /></a><br /><span>Standards Alignment with search results</span>

<a href="https://skitch.com/jimklo/gmdem/demo-toggle"><img width="600" src="https://img.skitch.com/20111124-t56cc1gyq6u4hyk4afweps22qt.medium.jpg" alt="demo-toggle" /></a><br /><span>Popup controls to select what get's inlined.</span>

<a href="https://skitch.com/jimklo/gmy9p/amps-demo-activity-data"><img width="600" src="https://img.skitch.com/20111123-cwyjd7mqmexqk3jp6b3auqi224.medium.jpg" alt="AMPS demo - activity data" /></a><br /><span>Paradata with search results</span>

###INSTALLATION

####Binary Install

This is what most people just wanting to try this out will want to use.  Those wanting to peek under the hood should install *Developing your own flavor*. If you just want to install the most current release [click here to install](https://raw.github.com/jimklo/AMPS-Chrome/master/dist/amps_v1_1.crx "Packed AMPS extension").

####Developing your own flavor

Follow step 4 of [Create and load an extension](http://code.google.com/chrome/extensions/getstarted.html#load) to load the "chrome" folder as an unpacked extension.

###DEVELOP

The AMPS extension is backed by additional CouchDB map/reduce views for a [v0.23.3](https://github.com/LearningRegistry/LearningRegistry/commits/0.23.3) [Learning Registry](https://github.com/LearningRegistry/LearningRegistry) node.

The views are located in the [couchdb](https://github.com/jimklo/AMPS-Chrome/tree/master/couchdb) folder within the git project. The plugin code itself is located in the [chrome](https://github.com/jimklo/AMPS-Chrome/tree/master/chrome) folder.

###DEPENDENCIES

The AMPS extension utilizes the following Open Source Javascript libraries/frameworks:
* [jQuery](http://jquery.com/) v1.6.4 [MIT License](https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt)
* [Mustache](http://mustache.github.com/) [mustache.js](https://github.com/janl/mustache.js)  [MIT License](https://github.com/janl/mustache.js/blob/master/LICENSE)
* [crypto-js](http://code.google.com/p/crypto-js/) v2.5.2 [New BSD License](http://www.opensource.org/licenses/bsd-license.php)
* [Lawnchair](http://westcoastlogic.com/lawnchair/) 0.6.1 [MIT License](http://westcoastlogic.com/lawnchair/license/)


###LICENSE

Copyright 2011 SRI International

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


This project has been funded at least or in part with Federal funds from the U.S. Department of Education under Contract Number ED-04-CO-0040/0010. The content of this publication does not necessarily reflect the views or policies of the U.S. Department of Education nor does mention of trade names, commercial products, or organizations imply endorsement by the U.S. Government.