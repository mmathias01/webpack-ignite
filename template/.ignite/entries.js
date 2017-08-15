/*
The format for entries is like this:

{
    'entry_name_1': {
        inputFile: 'inputfile1',
        outputFilename: 'outputfile1',
        outputTemplateFile: 'outputfile1'
    },
    'vue_main': {
        inputFile: 'vue_main',
        outputFilename: 'vue_main',
        outputTemplateFile: 'vue_page'
    }
}

You should not set extensions on the properties of the object 
and all are optional. They will be set as follows if omitted:

inputFile = name of the entry (e.g. 'entry_name_1')
outputFilename = inputFile
outputTemplateFile = outputFilename 

As long as you export an object that looks like this, 
you can use whatever method you want to get the entries.

For instance you could iterate the filesystem to pull all
templates from the public folder, or all the JS files in
the root of src etc...

*/

const _entries = {
    'index':{}
}

module.exports = _entries