using VacifyWeb.Models;
using Microsoft.SharePoint.Client;
using Microsoft.SharePoint.Client.UserProfiles;
using System;
using System.Collections.Generic;
using System.Web.Mvc;
using System.Linq;

namespace VacifyWeb.Controllers
{
    public class HomeController : Controller
    {
        [SharePointContextFilter]
        public ActionResult Index()
        {
            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            ViewBag.SPHostUrl = spContext.SPHostUrl;
            Employee employee = GetEmployee(spContext);

            return View(employee);
        }

        [SharePointContextFilter]
        [HttpGet]
        public JsonResult GetMyVacationRequests()
        {
            List<VacationRequest> vacationRequests = null;
            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            Employee employee = GetEmployee(spContext);

            using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
            {
                List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");
                CamlQuery query = new CamlQuery();
                query.ViewXml = String.Format(
                    "<View>" +
                        "<Query>" +
                            "<Where>" +
                                "<Eq>" +
                                    "<FieldRef Name=\"RequestBy\" />" +
                                    "<Value Type=\"Text\">{0}</Value>" +
                                "</Eq>" +
                            "</Where>" +
                        "</Query>" +
                        "<ViewFields>" +

                            "<FieldRef Name=\"StartDate\" />" +
                            "<FieldRef Name=\"_EndDate\" />" +
                            "<FieldRef Name=\"RequestBy\" />" +
                            "<FieldRef Name=\"Approver\" />" +
                            "<FieldRef Name=\"_Status\" />" +
                        "</ViewFields>" +
                        "<RowLimit>100</RowLimit>" +
                    "</View>",
                employee.Name);

                ListItemCollection vacationRequestItems = vacationRequestList.GetItems(query);
                clientContext.Load(vacationRequestItems);
                clientContext.ExecuteQuery();

                vacationRequests = vacationRequestItems
                        .Select(vacationRequest => new VacationRequest()
                        {
                            ID = ((int)vacationRequest["ID"]),
                            StartDate = ((DateTime)vacationRequest["StartDate"]),
                            EndDate = (DateTime)vacationRequest["_EndDate"],
                            RequestBy = vacationRequest["RequestBy"].ToString(),
                            Approver = vacationRequest["Approver"].ToString(),
                            Status = vacationRequest["_Status"].ToString()
                        }).ToList();
            }

            return Json(vacationRequests, JsonRequestBehavior.AllowGet);
        }

        [SharePointContextFilter]
        [HttpGet]
        public JsonResult GetMyEmployeesVacationRequests()
        {
            List<VacationRequest> vacationRequests = null;

            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            Employee employee = GetEmployee(spContext);

            using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
            {
                if (clientContext != null)
                {
                    List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");
                    CamlQuery query = new CamlQuery();
                    query.ViewXml = String.Format(
                        "<View>" +
                            "<Query>" +
                                "<Where>" +
                                    "<Eq>" +
                                        "<FieldRef Name=\"Approver\" />" +
                                        "<Value Type=\"Text\">{0}</Value>" +
                                    "</Eq>" +
                                "</Where>" +
                            "</Query>" +
                            "<ViewFields>" +

                                "<FieldRef Name=\"StartDate\" />" +
                                "<FieldRef Name=\"_EndDate\" />" +
                                "<FieldRef Name=\"RequestBy\" />" +
                                "<FieldRef Name=\"Approver\" />" +
                                "<FieldRef Name=\"_Status\" />" +
                            "</ViewFields>" +
                            "<RowLimit>100</RowLimit>" +
                        "</View>",
                    employee.Name);

                    ListItemCollection vacationRequestItems = vacationRequestList.GetItems(query);
                    clientContext.Load(vacationRequestItems);
                    clientContext.ExecuteQuery();

                    vacationRequests = vacationRequestItems
                            .Select(vacationRequest => new VacationRequest()
                            {
                                ID = ((int)vacationRequest["ID"]),
                                StartDate = ((DateTime)vacationRequest["StartDate"]),
                                EndDate = (DateTime)vacationRequest["_EndDate"],
                                RequestBy = vacationRequest["RequestBy"].ToString(),
                                Approver = vacationRequest["Approver"].ToString(),
                                Status = vacationRequest["_Status"].ToString()
                            }).ToList();
                }
            }

            return Json(vacationRequests, JsonRequestBehavior.AllowGet);
        }

        [SharePointContextFilter]
        [HttpPost]
        public JsonResult SaveVacationRequests(List<VacationRequest> vacationRequests)
        {
            if (vacationRequests != null)
            {
                var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
                Employee employee = GetEmployee(spContext);

                using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
                {
                    if (clientContext != null)
                    {
                        List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");
                        foreach (VacationRequest vacationRequest in vacationRequests)
                        {
                            if (vacationRequest.ID == 0)
                            {
                                vacationRequest.RequestBy = employee.Name;
                                vacationRequest.Approver = employee.Manager;
                                ListItem listItem = vacationRequestList.AddItem(new ListItemCreationInformation());
                                listItem["StartDate"] = vacationRequest.StartDate;
                                listItem["_EndDate"] = vacationRequest.EndDate;
                                listItem["RequestBy"] = vacationRequest.RequestBy;
                                listItem["Approver"] = vacationRequest.Approver;
                                listItem["_Status"] = "Pending";
                                listItem.Update();
                            }
                        }

                        clientContext.ExecuteQuery();
                    }
                }
            }

            return Json(vacationRequests, JsonRequestBehavior.AllowGet);
        }

        [SharePointContextFilter]
        [HttpPost]
        public JsonResult ApproveVacationRequest(VacationRequest vacationRequest)
        {
            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            setStatus(spContext, vacationRequest, "Approved");
            return new JsonResult();
        }

        [SharePointContextFilter]
        [HttpPost]
        public JsonResult RejectVacationRequest(VacationRequest vacationRequest)
        {
            var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);
            setStatus(spContext, vacationRequest, "Rejected");
            return new JsonResult();
        }

        private void setStatus(SharePointContext spContext, VacationRequest vacationRequest, string status)
        {
            using (var clientContext = spContext.CreateUserClientContextForSPAppWeb())
            {

                if (clientContext != null)
                {
                    List vacationRequestList = clientContext.Web.Lists.GetByTitle("Vacation Requests");
                    ListItem listItem = vacationRequestList.GetItemById(vacationRequest.ID);
                    listItem["_Status"] = status;
                    listItem.Update();
                    clientContext.ExecuteQuery();
                }
            }
        }

        private Employee GetEmployee(SharePointContext spContext)
        {
            Employee employee = null;

            using (var clientContext = spContext.CreateUserClientContextForSPHost())
            {
                if (clientContext != null)
                {
                    PeopleManager peopleManager = new PeopleManager(clientContext);


                    // Get current logged in user profile properties
                    PersonProperties employeeProperties = peopleManager.GetMyProperties();
                    clientContext.Load(employeeProperties,
                        e => e.DisplayName,
                        e => e.Email,
                        e => e.DirectReports,
                        e => e.UserProfileProperties
                    );
                    clientContext.ExecuteQuery();


                    // Get current logged in users manager name
                    PersonProperties managerProperties = null;
                    string managerAccountName = employeeProperties.UserProfileProperties["Manager"];
                    if (!string.IsNullOrEmpty(managerAccountName))
                    {
                        managerProperties = peopleManager.GetPropertiesFor(managerAccountName);
                        clientContext.Load(managerProperties, m => m.DisplayName);
                    }

                    // Get current logged in users employee names
                    List<PersonProperties> employeesProperties = new List<PersonProperties>();
                    foreach (string accountName in employeeProperties.DirectReports)
                    {
                        PersonProperties personProperties = peopleManager.GetPropertiesFor(accountName);
                        clientContext.Load(personProperties, p => p.DisplayName);
                        employeesProperties.Add(personProperties);
                    }
                    clientContext.ExecuteQuery();

                    List<string> employees = new List<string>();
                    foreach (PersonProperties personProperties in employeesProperties)
                    {
                        employees.Add(personProperties.DisplayName);
                    }

                    // Construct a new Employee model
                    employee = new Employee()
                    {
                        Name = employeeProperties.DisplayName,
                        PictureUrl = String.Format("{0}_layouts/15/userphoto.aspx?size={1}&accountname={2}",
                                        spContext.SPHostUrl, "L", employeeProperties.Email),
                        Manager = managerProperties != null ? managerProperties.DisplayName : "Lika A Boss!",
                        Employees = employees
                    };
                }
            }

            return employee;
        }
    }
}
