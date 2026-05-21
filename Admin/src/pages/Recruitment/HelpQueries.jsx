import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { searchHelpQueries, updateQueryStatus } from "../../api/helpQuery.api";

const STATUS_BADGE = { open: "warning", replied: "info", closed: "secondary" };
const STATUS_OPTIONS = ["open", "replied", "closed"];

const HelpQueries = () => {
  const { adminData } = useContext(AuthContext);

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(100);
  const [pageNo, setPageNo] = useState(0);
  const [column, setColumn] = useState();
  const [sortDir, setSortDir] = useState();

  useEffect(() => {
    fetchData();
  }, [pageNo, perPage, column, sortDir, query]);

  const fetchData = async () => {
    setLoading(true);
    let skip = (pageNo - 1) * perPage;
    if (skip < 0) skip = 0;
    try {
      const res = await searchHelpQueries({
        skip,
        per_page: perPage,
        sorton: column,
        sortdir: sortDir,
        match: query,
      });
      if (res.data.data.length > 0) {
        setRows(res.data.data[0].data);
        setTotalRows(res.data.data[0].count);
      } else {
        setRows([]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load help queries.";
      toast.error(msg);
      setRows([]);
    }
    setLoading(false);
  };

  const handleStatusChange = (id, status) => {
    updateQueryStatus(id, status)
      .then(() => {
        fetchData();
        toast.success("Status updated.");
      })
      .catch(() => toast.error("Status update failed."));
  };

  const col = [
    { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
    {
      name: "Name",
      selector: (r) => r.name,
      sortable: true,
      sortField: "name",
      minWidth: "140px",
    },
    {
      name: "Reg. ID",
      selector: (r) => r.registrationId || "—",
      minWidth: "130px",
    },
    {
      name: "Query Category",
      selector: (r) => r.queryCategory,
      sortable: true,
      sortField: "queryCategory",
      minWidth: "180px",
    },
    { name: "Mobile", selector: (r) => r.mobile || "—", minWidth: "130px" },
    {
      name: "Message",
      selector: (r) => r.message,
      minWidth: "120px",
      wrap: true,
    },
    {
      name: "Status",
      maxWidth: "120px",
      selector: (r) => (
        <span className={`badge bg-${STATUS_BADGE[r.status] ?? "secondary"}`}>
          {r.status}
        </span>
      ),
    },
    {
      name: "Date",
      selector: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—",
      sortable: true,
      sortField: "createdAt",
      minWidth: "110px",
    },
    {
      name: "Action",
      minWidth: "160px",
      selector: (r) => (
        <select
          className="form-select form-select-sm"
          value={r.status}
          onChange={(e) => handleStatusChange(r._id, e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
  ];

  document.title = `Help Queries | ${adminData?.companyName}`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            maintitle="Recruitment"
            title="Help Queries"
            pageTitle="Recruitment"
          />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <FormsHeader
                    formName="Help Query"
                    setQuery={setQuery}
                    showAddButton={false}
                  />
                </CardHeader>
                <CardBody>
                  <div className="table-responsive table-card mt-1 mb-1">
                    <DataTable
                      columns={col}
                      data={rows}
                      progressPending={loading}
                      sortServer
                      onSort={(c, d) => {
                        setColumn(c.sortField);
                        setSortDir(d);
                      }}
                      pagination
                      paginationServer
                      paginationTotalRows={totalRows}
                      paginationPerPage={100}
                      paginationRowsPerPageOptions={[50, 100, 200, totalRows]}
                      onChangeRowsPerPage={(n) => setPerPage(n)}
                      onChangePage={(p) => setPageNo(p)}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default HelpQueries;
