const commonmark = require("commonmark")
const fs = require("fs");

var friendlyTitle;
var publishDate;

// Recursive function to search parse tree for document
// metadata. If a document metadata block is found it's
// contents are extracted and stored and the metadata
// block is unlinked from the parse tree
function searchForMetadata(node)
{
    var current = node;
    while (current !== null)
    {
        if (current.type == 'code_block')
        {
            // console.log('checking code block');
            var metadataExpr = /document-metadata/
            var friendlyNameExpr = /friendly-name\:(.*)/
            var pubDateExpr = /publish-date\:(.*)/
            if (metadataExpr.test(current.literal))
            {
                console.log("is metadata block");
                var matches = current.literal.match(friendlyNameExpr);
                if (matches.length > 1)
                {
                    friendlyTitle = matches[1].trim();
                }

                var matches = current.literal.match(pubDateExpr);
                if (matches.length > 1)
                {
                    publishDate = new Date(matches[1].trim());
                }

                current.unlink();
            }
        }

        if (current.firstChild != null)
        {
            searchForMetadata(current.firstChild);
        }
        current = current.next;
    }
}

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();
var contents = fs.readFileSync("test.md",{encoding:'utf-8'});

// Parse Document into parse tree
var parsed =  reader.parse(contents);

// Search for the metadata block and extract metadata
searchForMetadata(parsed);

// Log metadata
console.log(`Friendly Title: ${friendlyTitle}`)
console.log(`Published on: ${publishDate.toLocaleDateString()}`)
console.log(' ');

// Convert to HTML and write HTML to console
var result = writer.render(parsed); 
console.log(result);

