function HistoryParser()
{
    var self = this;
    self.handlers = [];
    self.count = 0;
    
    self.parse = function(element)
    {
        var text = element.val();
        
        var lines = text.match(/[^\r\n]+/g);
        
        for(var i in lines)
        {
                self.parseURL(lines[i]);
        }
    }

    self.parseURL = function(line)
    {
        var sline = line.split('/');
        
        // http: , , domain , bits, of, url 
        
        try
        {
            var data = {protocol: sline[0], domain: getDomain(line), path: line.replace(/^.*:\/\/[^\/]+/, ''), url: line};
            
            if(sline.length < 3 || data.domain == false)
                throw "Not a URL :-/";
            
            self.count++;
            
            // Give the parsed line to all the registered handlers
            for(var i in self.handlers)
            {
                self.handlers[i].handle(data);
            }
        }
        catch(e)
        {
            
        }
    }
    
    /**
     * Add a handler - A handler will receive a parsed version of each line and
     * needs to do something with it!
     * 
     * It needs a .handle(data) method.  Data will be an object containing:
     *      domain
     *      path
     *      protocol
     *      url
     */
    self.addHandler = function(handler)
    {
        self.handlers.push(handler);
    }
}

/**
 * HTML History Parser takes an element and looks for A elements within it
 * The HREFs from the links are parsed as if they came from a simple URL list
 */
function HTMLHistoryParser()
{
    HistoryParser.call(this);
    
    var self = this;
    
    self.parse = function(element)
    {
        var links = element.find('a');

        console.log("WTF is this? ", this);

        links.each(function(index, link){
           self.parseURL($(link).attr('href')); 
        });
    }
}

/**
 * A handler that normalises and counts domains
 */
function DomainVisitCounter()
{
    var self = this;
    
    self.domains = [];
    
    self.handle = function(data)
    {
        var regdomain = getBaseDomain(data.domain);
        
        if(typeof self.domains[regdomain] == 'undefined')
        {
            self.domains[regdomain] = 0;
        }
        
        self.domains[regdomain]++;
    }
    
    self.getData = function()
    {
        return self.domains;
    }
}

/**
 * A handler that normalises and counts domains
 */
function TLDCounter()
{
    var self = this;
    
    self.tlds = [];
    
    self.handle = function(data)
    {
        var tld = data.domain.split('.').pop();
        
        if(typeof self.tlds[tld] == 'undefined')
        {
            self.tlds[tld] = 0;
        }
        
        self.tlds[tld]++;
    }
    
    self.getData = function()
    {
        return self.tlds;
    }
}


/**
 * Count protocols
 */
function ProtocolCounter()
{
    var self = this;
    
    self.protos = [];
    
    self.handle = function(data)
    {
        var proto = data.protocol;
        
        if(typeof self.protos[proto] == 'undefined')
        {
            self.protos[proto] = 0;
        }
        
        self.protos[proto]++;
    }
    
    self.getData = function()
    {
        return self.protos;
    }
}

/**
 * Index all URLS by domain
 */
function URLIndex()
{
    var self = this;
    
    self.domains = {};
    
    self.handle = function(data)
    {
        var regdomain = getBaseDomain(data.domain);
        
        if(typeof self.domains[regdomain] == 'undefined')
        {
            self.domains[regdomain] = [];
        }
        
        self.domains[regdomain].push(data);
    }
    
    self.getData = function()
    {
        return self.domains;
    }
}