# Platypus-Docs

An in house documentation generator for TypeScript. This generator will produce a graph of code comments that can then be stored in a database.

## Command Line
node plat-docs *code_path* *linkBaseUrl* *version_number*

## Comment example:

    /**
     * @name plat
     * @kind namespace
     * @access public
     * 
     * @description
     * The entry point into the platypus library.
     */
     
This will be parsed and turned into a graph node.

## Links
Links will be converted to Markdown in *description* and *remarks* tags when in the following format:

{@link *fully_qualified_name*|*Link Title*}

The command line argument for base link will be appended to the front of the URI and the corresponding database ID will be found for the linked node.

