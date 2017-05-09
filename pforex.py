import os
join = os.path.join
exists = os.path.exists

from logging import info
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.web import HTTPError
from markdown import markdown


class App (tornado.web.Application):
    def __init__(self, debug=False):
        """
        Settings for our application
        """
        settings = dict(
            template_path="templates",
            static_path="static",
            autoescape=None,
            debug=debug,  # restarts app server on changes to local files
        )

        """
        map URLs to Handlers, with regex patterns
        """

        handlers = [
            (r"/", Home),
        ]

        tornado.web.Application.__init__(self, handlers, **settings)


class Home(tornado.web.RequestHandler):
    def get(self):

        txt = open('README.md').read()
        txt = markdown(unicode(txt, 'utf-8'))

        self.render('index.html', README=txt)


class DocHandler(tornado.web.RequestHandler):
    """
        Main blog post handler.  Look in /docs/ for whatever
        the request is trying for, render it as markdown
    """
    def get(self, path):

        path = 'docs/' + path.replace('.', '').strip('/')
        if exists(path):
            #a folder
            lastname = os.path.split(path)[-1]
            txt = open('%s/%s.txt' % (path, lastname)).read()

        elif exists(path + '.txt'):
            txt = open(path+'.txt').read()

        else:
            # does not exist!
            raise HTTPError(404)

        doc = markdown(unicode(txt, 'utf-8'))
        self.render('legacy.html', doc=doc)


def main():
    from tornado.options import define, options
    define("port", default=8001, help="run on the given port", type=int)
    define("debug", default=False, help="run server in debug mode", type=bool)

    tornado.options.parse_command_line()

    http_server = tornado.httpserver.HTTPServer( App(debug=options.debug))
    http_server.listen(options.port)
    info('Serving on port %d' % options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
