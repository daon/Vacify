using System.Web;
using System.Web.Optimization;

namespace VacifyWeb
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
                bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/underscore.js",
                        "~/Scripts/angular.js",
                        "~/Scripts/angular-animate.js",
                        "~/Scripts/ui-bootstrap-tpls.js",
                        "~/Scripts/angular-toastr.tpls.js",
                        "~/Scripts/moment.js",
                        "~/Scripts/fullcalendar.js",
                        "~/Scripts/calendar.js",
                        "~/Scripts/app.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/angular-toastr.css",
                      "~/Content/fullcalendar.css",
                      "~/Content/site.css"));
        }
    }
}
