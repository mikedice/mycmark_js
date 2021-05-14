import {Parser, HtmlRenderer, Node} from "commonmark"
import * as fs from "fs"

var friendlyTitle: String|null =  "";
var publishDate: Date|null = new Date(0);

// Recursive function to search parse tree for document
// metadata. If a document metadata block is found it's
// contents are extracted and stored and the metadata
// block is unlinked from the parse tree
function searchForMetadata(node: Node)
{
    let current: Node|null = node;
    while (current !== null)
    {
        if (current.type == 'code_block')
        {
            // console.log('checking code block');
            var metadataExpr = /document-metadata/
            var friendlyNameExpr = /friendly-name\:(.*)/
            var pubDateExpr = /publish-date\:(.*)/
            if (current != null && current.literal != null)
            {
                if (metadataExpr.test(current.literal))
                {
                    console.log("is metadata block");
                    let matches = current.literal.match(friendlyNameExpr);
                    if (matches != null && matches.length > 1)
                    {
                        friendlyTitle = matches[1].trim();
                    }

                    matches = current.literal.match(pubDateExpr);
                    if (matches != null && matches.length > 1)
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
}

var reader = new Parser();
var writer = new HtmlRenderer();
var contents = fs.readFileSync("test.md",{encoding:'utf-8'});

// Parse Document into parse tree
var parsed =  reader.parse(contents);

// Search for the metadata block and extract metadata
searchForMetadata(parsed);

// Log metadata
if(friendlyTitle != null)
{
    console.log(`Friendly Title: ${friendlyTitle}`)
}

if(publishDate != null)
{
    console.log(`Published on: ${publishDate.toLocaleDateString()}`)
}
console.log(' ');

// Convert to HTML and write HTML to console
var result = writer.render(parsed); 
console.log(result);

