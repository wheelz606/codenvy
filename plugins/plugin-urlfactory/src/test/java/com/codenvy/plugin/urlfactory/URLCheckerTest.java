/*
 *  [2012] - [2017] Codenvy, S.A.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Codenvy S.A. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Codenvy S.A.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Codenvy S.A..
 */
package com.codenvy.plugin.urlfactory;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.mockito.InjectMocks;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import static org.eclipse.jetty.http.HttpStatus.NOT_FOUND_404;
import static org.eclipse.jetty.http.HttpStatus.OK_200;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

/**
 * Testing {@link URLChecker}
 *
 * @author Florent Benoit
 */
@Listeners(MockitoTestNGListener.class)
public class URLCheckerTest {

    /**
     * Instance to test.
     */
    @InjectMocks
    private URLChecker URLChecker;

    /**
     * Http jetty instance used in tests.
     */
    private Server server;

    /**
     * Port number used.
     */
    private int port;

    /**
     * Check that when url is null, NPE is thrown
     */
    @Test(expectedExceptions = NullPointerException.class)
    public void checkNullURL() {
        URLChecker.exists((String)null);
    }

    /**
     * Check that the url exists
     */
    @Test
    public void checkUrlFileExists() {

        // test to check if this url exist
        URL urlJson = URLCheckerTest.class.getResource("/" + URLCheckerTest.class.getName().replace('.', '/') + ".class");
        Assert.assertNotNull(urlJson);

        boolean exists = URLChecker.exists(urlJson);
        assertTrue(exists);
    }

    /**
     * Check when url doesn't exist
     */
    @Test
    public void checkUrlFileNotExists() {

        // test to check if this url exist
        URL urlJson =
                URLCheckerTest.class.getResource("/" + URLCheckerTest.class.getPackage().getName().replace('.', '/') + "/.codenvy.json");
        Assert.assertNotNull(urlJson);

        boolean exists = URLChecker.exists(urlJson.toString() + "-notfound");
        assertFalse(exists);
    }

    /**
     * Check when url is invalid
     */
    @Test
    public void checkUrlFileIsInvalid() {
        boolean exists = URLChecker.exists("hello world");
        assertFalse(exists);
    }

    /**
     * Check when url is invalid
     */
    @Test
    public void checkUrlIsInvalid() throws MalformedURLException {
        // test to check if this url exist
        URL urlJson =
                URLCheckerTest.class.getResource("/" + URLCheckerTest.class.getPackage().getName().replace('.', '/') + "/.codenvy.json");
        Assert.assertNotNull(urlJson);

        boolean exists = URLChecker.exists(new URL(urlJson.toString() + "-notfound"));
        assertFalse(exists);
    }


    /**
     * Check HTTP url.
     */
    @Test
    public void checkHTTPUrl() throws IOException {

        HttpURLConnection httpURLConnection = mock(HttpURLConnection.class);

        // if 200, it's ok
        when(httpURLConnection.getResponseCode()).thenReturn(OK_200);
        boolean exists = URLChecker.exists(httpURLConnection);
        assertTrue(exists);

        // if 404, it's ko
        reset(httpURLConnection);
        when(httpURLConnection.getResponseCode()).thenReturn(NOT_FOUND_404);
        exists = URLChecker.exists(httpURLConnection);
        assertFalse(exists);

        // failure, it's ko
        reset(httpURLConnection);
        when(httpURLConnection.getResponseCode()).thenThrow(IOException.class);
        exists = URLChecker.exists(httpURLConnection);
        assertFalse(exists);

        // check local server
        exists = URLChecker.exists("http://localhost:" + port);
        assertTrue(exists);
    }


    /**
     * Start http server to really test a HTTP endpoint.
     * as URL can't be mock
     *
     * @throws Exception
     *         if server is not started
     */
    @BeforeClass
    public void startJetty() throws Exception {
        this.server = new Server(0);
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        context.addServlet(new ServletHolder(new MyServlet()), "/");
        this.server.setHandler(context);
        this.server.start();
        this.port = ((ServerConnector)server.getConnectors()[0]).getLocalPort();
    }

    /**
     * Stops the server at the end
     *
     * @throws Exception
     */
    @AfterClass
    public void stopJetty() throws Exception {
        server.stop();
    }

    /**
     * Dummy servlet class.
     */
    static class MyServlet extends HttpServlet {
        protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException {
            resp.getOutputStream().print("hello");
        }

    }

}
